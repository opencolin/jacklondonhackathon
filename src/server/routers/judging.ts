import "server-only";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, sql } from "drizzle-orm";
import { router, judgeProcedure } from "@/server/trpc/init";
import {
  judges,
  judgeScores,
  submissions,
  projects,
  auditLog,
} from "@/server/db/schema";

const judgeKindValues = ["ai", "sponsor", "angel", "vc"] as const;

export const judgingRouter = router({
  scoresForSubmission: judgeProcedure
    .input(z.object({ submissionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(judgeScores)
        .where(eq(judgeScores.submissionId, input.submissionId))
        .orderBy(asc(judgeScores.createdAt));
      return rows;
    }),

  upsertScore: judgeProcedure
    .input(
      z.object({
        submissionId: z.string().uuid(),
        kind: z.enum(judgeKindValues),
        scores: z.record(z.string(), z.number()),
        notes: z.string().max(8000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.judgeKinds.includes(input.kind)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `You are not a ${input.kind} judge`,
        });
      }

      const values: number[] = Object.values(input.scores);
      if (values.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "scores cannot be empty",
        });
      }
      const weighted =
        values.reduce<number>((acc, v) => acc + v, 0) / values.length;

      const userId = ctx.user.id;

      return await ctx.db.transaction(async (tx) => {
        // Look up the judge row for this user + kind.
        const judgeRows = await tx
          .select()
          .from(judges)
          .where(
            and(eq(judges.userId, userId), eq(judges.kind, input.kind)),
          )
          .limit(1);
        const judge = judgeRows[0];
        if (!judge) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `No judge record for kind=${input.kind}`,
          });
        }

        // Verify submission exists and load related project.
        const subRows = await tx
          .select()
          .from(submissions)
          .where(eq(submissions.id, input.submissionId))
          .limit(1);
        const submission = subRows[0];
        if (!submission) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Submission not found",
          });
        }

        const [score] = await tx
          .insert(judgeScores)
          .values({
            submissionId: input.submissionId,
            judgeId: judge.id,
            judgeKind: input.kind,
            scoresJson: input.scores,
            weighted: weighted.toFixed(2),
            notes: input.notes,
          })
          .onConflictDoUpdate({
            target: [judgeScores.submissionId, judgeScores.judgeId],
            set: {
              judgeKind: input.kind,
              scoresJson: input.scores,
              weighted: weighted.toFixed(2),
              notes: input.notes,
            },
          })
          .returning();

        // Recompute project-level scores.
        const projectId = submission.projectId;
        const projectRows = await tx
          .select()
          .from(projects)
          .where(eq(projects.id, projectId))
          .limit(1);
        const project = projectRows[0];
        if (!project) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
          });
        }

        // Aggregate scores grouped by judge_kind across all submissions for this project.
        const aggRows = await tx
          .select({
            kind: judgeScores.judgeKind,
            avg: sql<string>`avg(${judgeScores.weighted})::text`,
          })
          .from(judgeScores)
          .innerJoin(
            submissions,
            eq(submissions.id, judgeScores.submissionId),
          )
          .where(eq(submissions.projectId, projectId))
          .groupBy(judgeScores.judgeKind);

        const byKind = new Map<string, number | null>();
        for (const row of aggRows) {
          const v = row.avg !== null ? Number(row.avg) : null;
          byKind.set(row.kind, Number.isFinite(v as number) ? (v as number) : null);
        }

        const aiScore = byKind.get("ai") ?? null;
        const sponsorAvg = byKind.get("sponsor") ?? null;
        const angelAvg = byKind.get("angel") ?? null;
        const vcAvg = byKind.get("vc") ?? null;

        // Investor avg = mean of angel + vc averages (ignoring nulls).
        const investorParts: number[] = [];
        if (angelAvg !== null) investorParts.push(angelAvg);
        if (vcAvg !== null) investorParts.push(vcAvg);
        const investorAvg = investorParts.length
          ? investorParts.reduce((a, b) => a + b, 0) / investorParts.length
          : null;

        // human_score = mean of available human aggregates (sponsor, angel, vc).
        const humanParts: number[] = [];
        if (sponsorAvg !== null) humanParts.push(sponsorAvg);
        if (angelAvg !== null) humanParts.push(angelAvg);
        if (vcAvg !== null) humanParts.push(vcAvg);
        const humanScore = humanParts.length
          ? humanParts.reduce((a, b) => a + b, 0) / humanParts.length
          : null;

        // composite = 0.4*ai + 0.4*sponsorAvg + 0.2*investorAvg
        // Skip null components and renormalize available weights.
        const components: { weight: number; value: number }[] = [];
        if (aiScore !== null) components.push({ weight: 0.4, value: aiScore });
        if (sponsorAvg !== null)
          components.push({ weight: 0.4, value: sponsorAvg });
        if (investorAvg !== null)
          components.push({ weight: 0.2, value: investorAvg });

        let compositeScore: number | null = null;
        if (components.length > 0) {
          const totalWeight = components.reduce((a, c) => a + c.weight, 0);
          if (totalWeight > 0) {
            compositeScore =
              components.reduce((a, c) => a + c.weight * c.value, 0) /
              totalWeight;
          }
        }

        await tx
          .update(projects)
          .set({
            aiScore: aiScore !== null ? aiScore.toFixed(2) : null,
            humanScore: humanScore !== null ? humanScore.toFixed(2) : null,
            compositeScore:
              compositeScore !== null ? compositeScore.toFixed(2) : null,
            updatedAt: new Date(),
          })
          .where(eq(projects.id, projectId));

        // Recompute compositeRank for all projects in the same event.
        await tx.execute(sql`
          WITH ranked AS (
            SELECT id, RANK() OVER (
              ORDER BY composite_score DESC NULLS LAST, submitted_at ASC NULLS LAST, created_at ASC
            ) AS rnk
            FROM projects
            WHERE event_id = ${project.eventId}
          )
          UPDATE projects p
          SET composite_rank = ranked.rnk
          FROM ranked
          WHERE p.id = ranked.id
        `);

        await tx.insert(auditLog).values({
          actorId: userId,
          action: "judging.upsertScore",
          targetType: "submission",
          targetId: input.submissionId,
          metadata: {
            kind: input.kind,
            weighted,
            projectId,
          },
        });

        return score;
      });
    }),
});
