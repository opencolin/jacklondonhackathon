import "server-only";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { asc, eq, inArray, sql } from "drizzle-orm";
import { router, adminProcedure } from "@/server/trpc/init";
import {
  judges,
  projects,
  events,
  boatManifest,
  users,
  auditLog,
} from "@/server/db/schema";

const judgeKindValues = ["ai", "sponsor", "angel", "vc"] as const;

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = typeof value === "string" ? value : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export const adminRouter = router({
  grantJudge: adminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        kind: z.enum(judgeKindValues),
        sponsorId: z.string().uuid().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.user.id;
      return await ctx.db.transaction(async (tx) => {
        const [judge] = await tx
          .insert(judges)
          .values({
            userId: input.userId,
            kind: input.kind,
            sponsorId: input.sponsorId,
            active: true,
          })
          .onConflictDoUpdate({
            target: [judges.userId, judges.kind, judges.sponsorId],
            set: { active: true },
          })
          .returning();

        await tx.insert(auditLog).values({
          actorId,
          action: "admin.grantJudge",
          targetType: "user",
          targetId: input.userId,
          metadata: { kind: input.kind, sponsorId: input.sponsorId ?? null },
        });

        return judge;
      });
    }),

  finalizeFinalists: adminProcedure
    .input(
      z.object({
        eventId: z.string().uuid(),
        topN: z.number().int().min(1).max(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.user.id;
      return await ctx.db.transaction(async (tx) => {
        const candidates = await tx
          .select({ id: projects.id })
          .from(projects)
          .where(eq(projects.eventId, input.eventId))
          .orderBy(
            sql`${projects.compositeRank} ASC NULLS LAST`,
            asc(projects.submittedAt),
          )
          .limit(input.topN);

        const ids = candidates.map((c) => c.id);
        if (ids.length === 0) {
          return { count: 0, ids: [] };
        }

        const now = new Date();
        await tx
          .update(projects)
          .set({ status: "finalist", finalizedAt: now, updatedAt: now })
          .where(inArray(projects.id, ids));

        await tx.insert(auditLog).values({
          actorId,
          action: "admin.finalizeFinalists",
          targetType: "event",
          targetId: input.eventId,
          metadata: { topN: input.topN, projectIds: ids },
        });

        return { count: ids.length, ids };
      });
    }),

  exportManifestCsv: adminProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.user.id;

      const eventRows = await ctx.db
        .select()
        .from(events)
        .where(eq(events.id, input.eventId))
        .limit(1);
      if (!eventRows[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }

      const rows = await ctx.db
        .select({
          manifest: boatManifest,
          user: users,
          project: projects,
        })
        .from(boatManifest)
        .leftJoin(users, eq(users.id, boatManifest.userId))
        .leftJoin(projects, eq(projects.id, boatManifest.projectId))
        .where(eq(boatManifest.eventId, input.eventId));

      const headers = [
        "user_email",
        "user_name",
        "role",
        "project_name",
        "emergency_contact_name",
        "emergency_contact_phone",
        "dietary",
        "swim_release_signed",
        "swim_release_signed_at",
        "checked_in",
        "checked_in_at",
        "notes",
      ];

      const lines: string[] = [headers.map(csvEscape).join(",")];
      for (const row of rows) {
        lines.push(
          [
            row.user?.email,
            row.user?.name,
            row.manifest.role,
            row.project?.name,
            row.manifest.emergencyContactName,
            row.manifest.emergencyContactPhone,
            row.manifest.dietary,
            row.manifest.swimReleaseSigned,
            row.manifest.swimReleaseSignedAt?.toISOString(),
            row.manifest.checkedIn,
            row.manifest.checkedInAt?.toISOString(),
            row.manifest.notes,
          ]
            .map(csvEscape)
            .join(","),
        );
      }
      const csv = lines.join("\n");

      await ctx.db.insert(auditLog).values({
        actorId,
        action: "admin.exportManifestCsv",
        targetType: "event",
        targetId: input.eventId,
        metadata: { rows: rows.length },
      });

      return csv;
    }),
});
