import "server-only";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import {
  router,
  publicProcedure,
  protectedProcedure,
} from "@/server/trpc/init";
import {
  officeHoursSessions,
  officeHoursRsvps,
  auditLog,
} from "@/server/db/schema";

export const officeHoursRouter = router({
  list: publicProcedure
    .input(
      z.object({
        parentEventId: z.string().uuid().optional(),
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input.parentEventId)
        conditions.push(
          eq(officeHoursSessions.parentEventId, input.parentEventId),
        );
      if (input.from)
        conditions.push(gte(officeHoursSessions.startsAt, new Date(input.from)));
      if (input.to)
        conditions.push(lte(officeHoursSessions.startsAt, new Date(input.to)));

      const where = conditions.length ? and(...conditions) : undefined;

      const rows = await ctx.db
        .select()
        .from(officeHoursSessions)
        .where(where)
        .orderBy(asc(officeHoursSessions.startsAt));

      return rows;
    }),

  rsvp: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      return await ctx.db.transaction(async (tx) => {
        const sessionRows = await tx
          .select()
          .from(officeHoursSessions)
          .where(eq(officeHoursSessions.id, input.sessionId))
          .limit(1);
        if (!sessionRows[0]) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Office hours session not found",
          });
        }

        const [rsvp] = await tx
          .insert(officeHoursRsvps)
          .values({
            sessionId: input.sessionId,
            userId,
            status: "rsvp",
          })
          .onConflictDoUpdate({
            target: [
              officeHoursRsvps.sessionId,
              officeHoursRsvps.userId,
            ],
            set: { status: "rsvp" },
          })
          .returning();

        await tx.insert(auditLog).values({
          actorId: userId,
          action: "officeHours.rsvp",
          targetType: "office_hours_session",
          targetId: input.sessionId,
        });

        return rsvp;
      });
    }),

  cancelRsvp: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      return await ctx.db.transaction(async (tx) => {
        await tx
          .delete(officeHoursRsvps)
          .where(
            and(
              eq(officeHoursRsvps.sessionId, input.sessionId),
              eq(officeHoursRsvps.userId, userId),
            ),
          );

        await tx.insert(auditLog).values({
          actorId: userId,
          action: "officeHours.cancelRsvp",
          targetType: "office_hours_session",
          targetId: input.sessionId,
        });

        return { ok: true as const };
      });
    }),
});
