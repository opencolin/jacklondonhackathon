import "server-only";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, gt, sql } from "drizzle-orm";
import {
  router,
  publicProcedure,
  protectedProcedure,
} from "@/server/trpc/init";
import {
  events,
  eventRegistrations,
  eventSponsors,
  sponsors,
  venues,
  auditLog,
} from "@/server/db/schema";

const eventStateValues = [
  "draft",
  "published",
  "live",
  "completed",
  "cancelled",
] as const;
const registrationSourceValues = ["builder", "company"] as const;

export const eventsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        state: z.enum(eventStateValues).optional(),
        parentEventId: z.string().uuid().optional(),
        limit: z.number().int().min(1).max(100).default(50),
        cursor: z.string().uuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input.state) conditions.push(eq(events.state, input.state));
      if (input.parentEventId)
        conditions.push(eq(events.parentEventId, input.parentEventId));
      if (input.cursor) conditions.push(gt(events.id, input.cursor));

      const where = conditions.length ? and(...conditions) : undefined;

      const rows = await ctx.db
        .select()
        .from(events)
        .where(where)
        .orderBy(asc(events.startsAt), asc(events.id))
        .limit(input.limit + 1);

      let nextCursor: string | undefined = undefined;
      if (rows.length > input.limit) {
        const nextItem = rows.pop();
        nextCursor = nextItem?.id;
      }

      return { items: rows, nextCursor };
    }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const eventRow = await ctx.db
        .select()
        .from(events)
        .where(eq(events.slug, input.slug))
        .limit(1);
      const event = eventRow[0];
      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }

      const venue = event.venueId
        ? (
            await ctx.db
              .select()
              .from(venues)
              .where(eq(venues.id, event.venueId))
              .limit(1)
          )[0] ?? null
        : null;

      const sponsorRows = await ctx.db
        .select({
          sponsor: sponsors,
          role: eventSponsors.role,
        })
        .from(eventSponsors)
        .innerJoin(sponsors, eq(sponsors.id, eventSponsors.sponsorId))
        .where(eq(eventSponsors.eventId, event.id));

      const registeredCountRow = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(eventRegistrations)
        .where(
          and(
            eq(eventRegistrations.eventId, event.id),
            eq(eventRegistrations.status, "rsvp"),
          ),
        );
      const registeredCount = registeredCountRow[0]?.count ?? 0;

      return { event, venue, sponsors: sponsorRows, registeredCount };
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const eventRow = await ctx.db
        .select()
        .from(events)
        .where(eq(events.id, input.id))
        .limit(1);
      const event = eventRow[0];
      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }

      const venue = event.venueId
        ? (
            await ctx.db
              .select()
              .from(venues)
              .where(eq(venues.id, event.venueId))
              .limit(1)
          )[0] ?? null
        : null;

      const sponsorRows = await ctx.db
        .select({
          sponsor: sponsors,
          role: eventSponsors.role,
        })
        .from(eventSponsors)
        .innerJoin(sponsors, eq(sponsors.id, eventSponsors.sponsorId))
        .where(eq(eventSponsors.eventId, event.id));

      const registeredCountRow = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(eventRegistrations)
        .where(
          and(
            eq(eventRegistrations.eventId, event.id),
            eq(eventRegistrations.status, "rsvp"),
          ),
        );
      const registeredCount = registeredCountRow[0]?.count ?? 0;

      return { event, venue, sponsors: sponsorRows, registeredCount };
    }),

  register: protectedProcedure
    .input(
      z.object({
        eventId: z.string().uuid(),
        source: z.enum(registrationSourceValues).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      return await ctx.db.transaction(async (tx) => {
        const existing = await tx
          .select()
          .from(eventRegistrations)
          .where(
            and(
              eq(eventRegistrations.eventId, input.eventId),
              eq(eventRegistrations.userId, userId),
            ),
          )
          .limit(1);

        const previous = existing[0];

        const [registration] = await tx
          .insert(eventRegistrations)
          .values({
            eventId: input.eventId,
            userId,
            status: "rsvp",
            source: input.source ?? "builder",
          })
          .onConflictDoUpdate({
            target: [eventRegistrations.eventId, eventRegistrations.userId],
            set: {
              status: "rsvp",
              source: input.source ?? "builder",
            },
          })
          .returning();

        // Increment counter only if not previously rsvp'd
        const wasActive = previous && previous.status === "rsvp";
        if (!wasActive) {
          await tx
            .update(events)
            .set({ registered: sql`${events.registered} + 1` })
            .where(eq(events.id, input.eventId));
        }

        await tx.insert(auditLog).values({
          actorId: userId,
          action: "events.register",
          targetType: "event",
          targetId: input.eventId,
          metadata: { source: input.source ?? "builder" },
        });

        return registration;
      });
    }),

  cancelRegistration: protectedProcedure
    .input(
      z.object({
        eventId: z.string().uuid(),
        source: z.enum(registrationSourceValues).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      return await ctx.db.transaction(async (tx) => {
        const existing = await tx
          .select()
          .from(eventRegistrations)
          .where(
            and(
              eq(eventRegistrations.eventId, input.eventId),
              eq(eventRegistrations.userId, userId),
            ),
          )
          .limit(1);

        const previous = existing[0];
        if (!previous) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Registration not found",
          });
        }

        const [updated] = await tx
          .update(eventRegistrations)
          .set({ status: "cancelled" })
          .where(eq(eventRegistrations.id, previous.id))
          .returning();

        if (previous.status === "rsvp") {
          await tx
            .update(events)
            .set({
              registered: sql`GREATEST(${events.registered} - 1, 0)`,
            })
            .where(eq(events.id, input.eventId));
        }

        await tx.insert(auditLog).values({
          actorId: userId,
          action: "events.cancelRegistration",
          targetType: "event",
          targetId: input.eventId,
        });

        return updated;
      });
    }),
});
