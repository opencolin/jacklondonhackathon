"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db";
import { events, projects, teams, teamMemberships } from "@/server/db/schema";
import { safeAuth } from "@/server/lib/safe-auth";

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((v) => (v ? v : null))
  .refine(
    (v) => v === null || /^https?:\/\//i.test(v),
    "Must be a URL starting with http:// or https://",
  );

const schema = z.object({
  eventId: z.string().uuid("Invalid event id."),
  name: z.string().trim().min(1, "Project name is required").max(120),
  summary: z.string().trim().max(2000).optional().transform((v) => (v ? v : null)),
  repoUrl: optionalUrl,
  demoUrl: optionalUrl,
  status: z.enum(["draft", "submitted"]).default("draft"),
});

export type ProjectSaveState =
  | { status: "idle" }
  | { status: "ok"; savedAt: string; projectStatus: "draft" | "submitted" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };

// Postgres error codes we care about (postgres-js surfaces `code` on the error).
const PG_INVALID_FK = "23503";
const PG_UNIQUE_VIOLATION = "23505";

type PgErr = { code?: string; message?: string };
const errCode = (e: unknown): string | undefined =>
  (typeof e === "object" && e !== null && "code" in e
    ? (e as PgErr).code
    : undefined);

export async function saveProject(
  _prev: ProjectSaveState,
  formData: FormData,
): Promise<ProjectSaveState> {
  const session = await safeAuth();
  if (!session?.user?.id) {
    return { status: "error", message: "Not signed in." };
  }

  const parsed = schema.safeParse({
    eventId: formData.get("eventId"),
    name: formData.get("name"),
    summary: formData.get("summary"),
    repoUrl: formData.get("repoUrl"),
    demoUrl: formData.get("demoUrl"),
    status: formData.get("status") ?? "draft",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Some fields look off — check the highlighted ones.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const userId = session.user.id;
  const { eventId, name, summary, repoUrl, demoUrl, status } = parsed.data;

  // Confirm the event exists. Surfaces a clean message instead of a
  // FK-violation cascade later.
  let eventRow: { id: string } | undefined;
  try {
    [eventRow] = await db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);
  } catch (err) {
    console.error("[saveProject] event lookup failed", err);
    return { status: "error", message: "Database is unreachable. Try again in a moment." };
  }
  if (!eventRow) {
    return { status: "error", message: "Event not found." };
  }
  const eventIdConfirmed = eventRow.id;

  // Find or create the user's solo team for this event. Schema has a
  // UNIQUE(event_id, leader_id) index (M1: one team per leader per
  // event), so two concurrent inserts cannot both succeed.
  let team: { id: string } | undefined;
  try {
    [team] = await db
      .select({ id: teams.id })
      .from(teams)
      .where(and(eq(teams.eventId, eventIdConfirmed), eq(teams.leaderId, userId)))
      .limit(1);

    if (!team) {
      const teamName =
        (session.user.name?.split(" ")[0] ?? "Builder") + "'s team";
      // ON CONFLICT DO NOTHING handles the race: if another concurrent
      // save just created this team, the insert is a no-op and we
      // re-SELECT below.
      const [created] = await db
        .insert(teams)
        .values({ eventId: eventIdConfirmed, name: teamName, leaderId: userId })
        .onConflictDoNothing({ target: [teams.eventId, teams.leaderId] })
        .returning({ id: teams.id });

      if (created) {
        team = created;
        await db
          .insert(teamMemberships)
          .values({ teamId: team.id, userId, role: "leader" })
          .onConflictDoNothing();
      } else {
        // Lost the race; the other request created it. Look it up.
        [team] = await db
          .select({ id: teams.id })
          .from(teams)
          .where(
            and(
              eq(teams.eventId, eventIdConfirmed),
              eq(teams.leaderId, userId),
            ),
          )
          .limit(1);
      }
    }
  } catch (err) {
    console.error("[saveProject] team find/create failed", err);
    const code = errCode(err);
    if (code === PG_UNIQUE_VIOLATION) {
      return { status: "error", message: "Two saves collided. Try saving again." };
    }
    return { status: "error", message: "Couldn't set up your team. Try again." };
  }

  if (!team) {
    return { status: "error", message: "Couldn't create your team. Try again." };
  }

  // Upsert the project for this team + event.
  try {
    const [existing] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(
        and(eq(projects.teamId, team.id), eq(projects.eventId, eventIdConfirmed)),
      )
      .limit(1);

    if (existing) {
      await db
        .update(projects)
        .set({
          name,
          summary,
          repoUrl,
          demoUrl,
          status,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, existing.id));
    } else {
      await db.insert(projects).values({
        teamId: team.id,
        eventId: eventIdConfirmed,
        name,
        summary,
        repoUrl,
        demoUrl,
        status,
      });
    }
  } catch (err) {
    console.error("[saveProject] project write failed", err);
    const code = errCode(err);
    if (code === PG_INVALID_FK) {
      return { status: "error", message: "Event no longer exists." };
    }
    return {
      status: "error",
      message: "Couldn't save right now. Try again in a moment.",
    };
  }

  revalidatePath(`/builders/dashboard/events/${eventIdConfirmed}/builder`);
  return {
    status: "ok",
    savedAt: new Date().toISOString(),
    projectStatus: status,
  };
}
