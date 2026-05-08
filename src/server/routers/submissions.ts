import "server-only";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { router, protectedProcedure } from "@/server/trpc/init";
import {
  submissions,
  projects,
  teams,
  teamMemberships,
} from "@/server/db/schema";

async function userCanReadProject(
  db: import("@/server/db").Db,
  projectId: string,
  userId: string,
): Promise<boolean> {
  const projectRows = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  const project = projectRows[0];
  if (!project) return false;

  const teamRows = await db
    .select()
    .from(teams)
    .where(eq(teams.id, project.teamId))
    .limit(1);
  const team = teamRows[0];
  if (!team) return false;
  if (team.leaderId === userId) return true;

  const memberRows = await db
    .select()
    .from(teamMemberships)
    .where(eq(teamMemberships.teamId, team.id))
    .limit(50);
  return memberRows.some((m) => m.userId === userId);
}

export const submissionsRouter = router({
  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const subRows = await ctx.db
        .select()
        .from(submissions)
        .where(eq(submissions.id, input.id))
        .limit(1);
      const submission = subRows[0];
      if (!submission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Submission not found",
        });
      }

      const isJudge = ctx.judgeKinds.length > 0;
      if (!isJudge) {
        const allowed = await userCanReadProject(
          ctx.db,
          submission.projectId,
          ctx.user.id,
        );
        if (!allowed) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not allowed to read this submission",
          });
        }
      }

      return submission;
    }),

  latestForProject: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const isJudge = ctx.judgeKinds.length > 0;
      if (!isJudge) {
        const allowed = await userCanReadProject(
          ctx.db,
          input.projectId,
          ctx.user.id,
        );
        if (!allowed) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not allowed to read this project's submissions",
          });
        }
      }

      const subRows = await ctx.db
        .select()
        .from(submissions)
        .where(eq(submissions.projectId, input.projectId))
        .orderBy(desc(submissions.createdAt))
        .limit(1);
      return subRows[0] ?? null;
    }),
});
