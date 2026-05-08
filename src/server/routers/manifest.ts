import "server-only";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import {
  router,
  protectedProcedure,
  adminProcedure,
} from "@/server/trpc/init";
import {
  boatManifest,
  users,
  projects,
  auditLog,
} from "@/server/db/schema";

export const manifestRouter = router({
  me: protectedProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const rows = await ctx.db
        .select()
        .from(boatManifest)
        .where(
          and(
            eq(boatManifest.eventId, input.eventId),
            eq(boatManifest.userId, userId),
          ),
        )
        .limit(1);
      return rows[0] ?? null;
    }),

  upsertContact: protectedProcedure
    .input(
      z.object({
        eventId: z.string().uuid(),
        emergencyContactName: z.string().min(1).max(200),
        emergencyContactPhone: z.string().min(1).max(64),
        dietary: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      return await ctx.db.transaction(async (tx) => {
        const [entry] = await tx
          .insert(boatManifest)
          .values({
            eventId: input.eventId,
            userId,
            role: "builder",
            emergencyContactName: input.emergencyContactName,
            emergencyContactPhone: input.emergencyContactPhone,
            dietary: input.dietary,
          })
          .onConflictDoUpdate({
            target: [boatManifest.eventId, boatManifest.userId],
            set: {
              emergencyContactName: input.emergencyContactName,
              emergencyContactPhone: input.emergencyContactPhone,
              dietary: input.dietary,
            },
          })
          .returning();

        await tx.insert(auditLog).values({
          actorId: userId,
          action: "manifest.upsertContact",
          targetType: "boat_manifest",
          targetId: entry?.id ?? null,
          metadata: { eventId: input.eventId },
        });

        return entry;
      });
    }),

  signSwimRelease: protectedProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      return await ctx.db.transaction(async (tx) => {
        const now = new Date();
        const [entry] = await tx
          .insert(boatManifest)
          .values({
            eventId: input.eventId,
            userId,
            role: "builder",
            swimReleaseSigned: true,
            swimReleaseSignedAt: now,
          })
          .onConflictDoUpdate({
            target: [boatManifest.eventId, boatManifest.userId],
            set: {
              swimReleaseSigned: true,
              swimReleaseSignedAt: now,
            },
          })
          .returning();

        await tx.insert(auditLog).values({
          actorId: userId,
          action: "manifest.signSwimRelease",
          targetType: "boat_manifest",
          targetId: entry?.id ?? null,
          metadata: { eventId: input.eventId },
        });

        return entry;
      });
    }),

  export: adminProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
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

      return rows;
    }),
});
