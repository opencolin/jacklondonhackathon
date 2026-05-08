import "server-only";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import {
  router,
  publicProcedure,
  protectedProcedure,
} from "@/server/trpc/init";
import {
  projects,
  teams,
  teamMemberships,
  events,
  submissions,
  auditLog,
} from "@/server/db/schema";

const githubUrlRegex = /^https?:\/\/(www\.)?github\.com\/[^/\s]+\/[^/\s]+/i;

export const projectsRouter = router({
  upsert: protectedProcedure
    .input(
      z.object({
        teamId: z.string().uuid(),
        eventId: z.string().uuid(),
        name: z.string().min(1).max(160),
        summary: z.string().max(4000).optional(),
        repoUrl: z.string().url().optional(),
        demoUrl: z.string().url().optional(),
        videoUrl: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
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
        if (team.leaderId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only the team leader can edit the project",
          });
        }
        if (team.eventId !== input.eventId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Team does not belong to that event",
          });
        }

        const [project] = await tx
          .insert(projects)
          .values({
            teamId: input.teamId,
            eventId: input.eventId,
            name: input.name,
            summary: input.summary,
            repoUrl: input.repoUrl,
            demoUrl: input.demoUrl,
            videoUrl: input.videoUrl,
            status: "draft",
          })
          .onConflictDoUpdate({
            target: [projects.teamId, projects.eventId],
            set: {
              name: input.name,
              summary: input.summary,
              repoUrl: input.repoUrl,
              demoUrl: input.demoUrl,
              videoUrl: input.videoUrl,
              updatedAt: new Date(),
            },
          })
          .returning();

        if (!project) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to upsert project",
          });
        }

        await tx.insert(auditLog).values({
          actorId: userId,
          action: "projects.upsert",
          targetType: "project",
          targetId: project.id,
          metadata: { teamId: input.teamId, eventId: input.eventId },
        });

        return project;
      });
    }),

  submit: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      return await ctx.db.transaction(async (tx) => {
        const projectRows = await tx
          .select()
          .from(projects)
          .where(eq(projects.id, input.projectId))
          .limit(1);
        const project = projectRows[0];
        if (!project) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
          });
        }

        const teamRows = await tx
          .select()
          .from(teams)
          .where(eq(teams.id, project.teamId))
          .limit(1);
        const team = teamRows[0];
        if (!team) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Team not found",
          });
        }
        if (team.leaderId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only the team leader can submit",
          });
        }

        if (!project.repoUrl || !githubUrlRegex.test(project.repoUrl)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "A github.com repo URL is required to submit",
          });
        }

        const now = new Date();
        const [updatedProject] = await tx
          .update(projects)
          .set({ status: "submitted", submittedAt: now, updatedAt: now })
          .where(eq(projects.id, project.id))
          .returning();

        const [submission] = await tx
          .insert(submissions)
          .values({
            projectId: project.id,
            status: "queued",
          })
          .returning();
        // TODO(judge-worker): enqueue judge.score job with submission.id

        await tx.insert(auditLog).values({
          actorId: userId,
          action: "projects.submit",
          targetType: "project",
          targetId: project.id,
          metadata: { submissionId: submission?.id },
        });

        return { project: updatedProject, submission };
      });
    }),

  mySubmissions: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    // Find teams the user is a member of (or leads).
    const memberRows = await ctx.db
      .select({ teamId: teamMemberships.teamId })
      .from(teamMemberships)
      .where(eq(teamMemberships.userId, userId));

    const ledTeamRows = await ctx.db
      .select({ id: teams.id })
      .from(teams)
      .where(eq(teams.leaderId, userId));

    const teamIds = Array.from(
      new Set([
        ...memberRows.map((r) => r.teamId),
        ...ledTeamRows.map((r) => r.id),
      ]),
    );
    if (teamIds.length === 0) return [];

    const myProjects = await ctx.db
      .select()
      .from(projects)
      .where(inArray(projects.teamId, teamIds));

    if (myProjects.length === 0) return [];

    const projectIds = myProjects.map((p) => p.id);
    const subs = await ctx.db
      .select()
      .from(submissions)
      .where(inArray(submissions.projectId, projectIds))
      .orderBy(desc(submissions.createdAt));

    const latestByProject = new Map<string, (typeof subs)[number]>();
    for (const s of subs) {
      if (!latestByProject.has(s.projectId)) {
        latestByProject.set(s.projectId, s);
      }
    }

    return myProjects.map((p) => ({
      project: p,
      latestSubmission: latestByProject.get(p.id) ?? null,
    }));
  }),

  leaderboardForEvent: publicProcedure
    .input(
      z.object({
        eventId: z.string().uuid(),
        limit: z.number().int().min(1).max(200).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const eventRow = await ctx.db
        .select()
        .from(events)
        .where(eq(events.id, input.eventId))
        .limit(1);
      const event = eventRow[0];
      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }

      const publicAt = event.scoringConfigJson?.public_leaderboard_at;
      if (publicAt) {
        const publicAtDate = new Date(publicAt);
        if (Number.isFinite(publicAtDate.getTime()) && new Date() < publicAtDate) {
          if (!ctx.user) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "LEADERBOARD_LOCKED",
            });
          }
        }
      }

      const rows = await ctx.db
        .select()
        .from(projects)
        .where(
          and(
            eq(projects.eventId, input.eventId),
            sql`${projects.compositeRank} IS NOT NULL`,
          ),
        )
        .orderBy(asc(projects.compositeRank))
        .limit(input.limit);

      return rows;
    }),
});
