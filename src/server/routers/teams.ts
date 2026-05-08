import "server-only";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, eq, inArray } from "drizzle-orm";
import { router, protectedProcedure } from "@/server/trpc/init";
import {
  teams,
  teamMemberships,
  teamInvitations,
  auditLog,
} from "@/server/db/schema";

export const teamsRouter = router({
  my: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const memberRows = await ctx.db
      .select({ teamId: teamMemberships.teamId })
      .from(teamMemberships)
      .where(eq(teamMemberships.userId, userId));

    const teamIds = memberRows.map((r) => r.teamId);

    const ledTeams = await ctx.db
      .select()
      .from(teams)
      .where(eq(teams.leaderId, userId));

    const memberTeams =
      teamIds.length > 0
        ? await ctx.db.select().from(teams).where(inArray(teams.id, teamIds))
        : [];

    // Dedupe by id
    const seen = new Set<string>();
    const all = [...ledTeams, ...memberTeams].filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });

    return all;
  }),

  create: protectedProcedure
    .input(
      z.object({
        eventId: z.string().uuid(),
        name: z.string().min(1).max(120),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      return await ctx.db.transaction(async (tx) => {
        const [team] = await tx
          .insert(teams)
          .values({
            eventId: input.eventId,
            name: input.name,
            leaderId: userId,
          })
          .returning();

        if (!team) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create team",
          });
        }

        await tx.insert(teamMemberships).values({
          teamId: team.id,
          userId,
          role: "leader",
        });

        await tx.insert(auditLog).values({
          actorId: userId,
          action: "teams.create",
          targetType: "team",
          targetId: team.id,
          metadata: { eventId: input.eventId, name: input.name },
        });

        return team;
      });
    }),

  addMember: protectedProcedure
    .input(
      z.object({
        teamId: z.string().uuid(),
        userId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.user.id;
      return await ctx.db.transaction(async (tx) => {
        const teamRows = await tx
          .select()
          .from(teams)
          .where(eq(teams.id, input.teamId))
          .limit(1);
        const team = teamRows[0];
        if (!team) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Team not found" });
        }
        if (team.leaderId !== actorId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only the team leader can add members",
          });
        }

        const [membership] = await tx
          .insert(teamMemberships)
          .values({
            teamId: input.teamId,
            userId: input.userId,
            role: "member",
          })
          .onConflictDoNothing()
          .returning();

        await tx.insert(auditLog).values({
          actorId,
          action: "teams.addMember",
          targetType: "team",
          targetId: input.teamId,
          metadata: { addedUserId: input.userId },
        });

        return membership ?? null;
      });
    }),

  removeMember: protectedProcedure
    .input(
      z.object({
        teamId: z.string().uuid(),
        userId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.user.id;
      return await ctx.db.transaction(async (tx) => {
        const teamRows = await tx
          .select()
          .from(teams)
          .where(eq(teams.id, input.teamId))
          .limit(1);
        const team = teamRows[0];
        if (!team) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Team not found" });
        }

        const isLeader = team.leaderId === actorId;
        const isSelf = actorId === input.userId;
        if (!isLeader && !isSelf) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only the team leader can remove other members",
          });
        }
        if (input.userId === team.leaderId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot remove the team leader",
          });
        }

        await tx
          .delete(teamMemberships)
          .where(
            and(
              eq(teamMemberships.teamId, input.teamId),
              eq(teamMemberships.userId, input.userId),
            ),
          );

        await tx.insert(auditLog).values({
          actorId,
          action: "teams.removeMember",
          targetType: "team",
          targetId: input.teamId,
          metadata: { removedUserId: input.userId },
        });

        return { ok: true as const };
      });
    }),

  invite: protectedProcedure
    .input(
      z.object({
        teamId: z.string().uuid(),
        email: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.user.id;
      return await ctx.db.transaction(async (tx) => {
        const teamRows = await tx
          .select()
          .from(teams)
          .where(eq(teams.id, input.teamId))
          .limit(1);
        const team = teamRows[0];
        if (!team) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Team not found" });
        }
        if (team.leaderId !== actorId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only the team leader can send invitations",
          });
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const [invitation] = await tx
          .insert(teamInvitations)
          .values({
            teamId: input.teamId,
            email: input.email,
            invitedById: actorId,
            status: "pending",
            expiresAt,
          })
          .returning();

        if (!invitation) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create invitation",
          });
        }

        await tx.insert(auditLog).values({
          actorId,
          action: "teams.invite",
          targetType: "team_invitation",
          targetId: invitation.id,
          metadata: { teamId: input.teamId, email: input.email },
        });

        return invitation;
      });
    }),

  acceptInvite: protectedProcedure
    .input(z.object({ invitationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.user.id;
      const userEmail = ctx.user.email;
      return await ctx.db.transaction(async (tx) => {
        const invRows = await tx
          .select()
          .from(teamInvitations)
          .where(eq(teamInvitations.id, input.invitationId))
          .limit(1);
        const invitation = invRows[0];
        if (!invitation) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invitation not found",
          });
        }
        if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "This invitation is not addressed to you",
          });
        }
        if (invitation.status !== "pending") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Invitation is already ${invitation.status}`,
          });
        }
        if (invitation.expiresAt < new Date()) {
          await tx
            .update(teamInvitations)
            .set({ status: "expired" })
            .where(eq(teamInvitations.id, invitation.id));
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invitation has expired",
          });
        }

        await tx
          .update(teamInvitations)
          .set({ status: "accepted" })
          .where(eq(teamInvitations.id, invitation.id));

        await tx
          .insert(teamMemberships)
          .values({
            teamId: invitation.teamId,
            userId: actorId,
            role: "member",
          })
          .onConflictDoNothing();

        await tx.insert(auditLog).values({
          actorId,
          action: "teams.acceptInvite",
          targetType: "team_invitation",
          targetId: invitation.id,
          metadata: { teamId: invitation.teamId },
        });

        return { ok: true as const, teamId: invitation.teamId };
      });
    }),

  declineInvite: protectedProcedure
    .input(z.object({ invitationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.user.id;
      const userEmail = ctx.user.email;
      return await ctx.db.transaction(async (tx) => {
        const invRows = await tx
          .select()
          .from(teamInvitations)
          .where(eq(teamInvitations.id, input.invitationId))
          .limit(1);
        const invitation = invRows[0];
        if (!invitation) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invitation not found",
          });
        }
        if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "This invitation is not addressed to you",
          });
        }
        if (invitation.status !== "pending") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Invitation is already ${invitation.status}`,
          });
        }

        await tx
          .update(teamInvitations)
          .set({ status: "declined" })
          .where(eq(teamInvitations.id, invitation.id));

        await tx.insert(auditLog).values({
          actorId,
          action: "teams.declineInvite",
          targetType: "team_invitation",
          targetId: invitation.id,
          metadata: { teamId: invitation.teamId },
        });

        return { ok: true as const };
      });
    }),
});
