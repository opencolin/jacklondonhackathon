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
  eventId: z.string().min(1),
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

  try {
    // Confirm the event exists; otherwise eventId is bogus and we'd
    // FK-violate.
    const [event] = await db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);
    if (!event) {
      return { status: "error", message: "Event not found." };
    }

    // Find or create the user's team for this event. M1: every builder
    // is auto-given a solo team named after their display name.
    let [team] = await db
      .select({ id: teams.id })
      .from(teams)
      .where(and(eq(teams.eventId, event.id), eq(teams.leaderId, userId)))
      .limit(1);

    if (!team) {
      const teamName =
        (session.user.name?.split(" ")[0] ?? "Builder") + "'s team";
      const [createdTeam] = await db
        .insert(teams)
        .values({
          eventId: event.id,
          name: teamName,
          leaderId: userId,
        })
        .returning({ id: teams.id });
      team = createdTeam;
      if (team) {
        await db
          .insert(teamMemberships)
          .values({ teamId: team.id, userId, role: "leader" })
          .onConflictDoNothing();
      }
    }

    if (!team) {
      return { status: "error", message: "Couldn't create your team. Try again." };
    }

    // Upsert the project for this team + event.
    const [existing] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.teamId, team.id), eq(projects.eventId, event.id)))
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
        eventId: event.id,
        name,
        summary,
        repoUrl,
        demoUrl,
        status,
      });
    }
  } catch (err) {
    console.error("[saveProject] db write failed", err);
    return {
      status: "error",
      message: "Couldn't save right now. Try again in a moment.",
    };
  }

  revalidatePath(`/builders/dashboard/events/${eventId}/builder`);
  return {
    status: "ok",
    savedAt: new Date().toISOString(),
    projectStatus: status,
  };
}
