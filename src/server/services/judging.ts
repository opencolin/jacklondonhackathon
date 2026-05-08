import "server-only";

import { createHash } from "node:crypto";

import { and, eq, sql } from "drizzle-orm";

import { db as defaultDb, type Db } from "@/server/db";
import {
  auditLog,
  judgeScores,
  projects,
  submissions,
} from "@/server/db/schema";
import { snapshotRepo } from "@/server/integrations/github";
import { nebiusJudge } from "@/server/integrations/nebius";

// =============================================================================
// Rubric
// =============================================================================

export const RUBRIC_VERSION = "v1";

export const RUBRIC = [
  {
    key: "usefulness",
    weight: 0.3,
    prompt:
      "You are judging a hackathon project on USEFULNESS. Does the project solve a real, " +
      "concrete problem that a real person or business would care about? Reward projects " +
      "with a believable user, a clear use case, and evidence of demand. Penalize toy " +
      "demos, tech-for-tech's-sake, and ideas that solve no one's actual problem. " +
      "Respond with a single integer score from 0 to 10 followed by exactly one paragraph " +
      "of reasoning. Format your answer as: 'SCORE: <int>\\nREASONING: <one paragraph>'.",
  },
  {
    key: "integration_depth",
    weight: 0.3,
    prompt:
      "You are judging a hackathon project on INTEGRATION DEPTH with the sponsor stack " +
      "(Nebius, Composio, Tavily, etc). How meaningfully does the project use the sponsor " +
      "tools? Reward deep, load-bearing usage where the project would not work without " +
      "them. Penalize surface-level imports that could be swapped for any other vendor in " +
      "five minutes. Respond with a single integer score from 0 to 10 followed by exactly " +
      "one paragraph of reasoning. Format your answer as: 'SCORE: <int>\\nREASONING: <one paragraph>'.",
  },
  {
    key: "demo_quality",
    weight: 0.2,
    prompt:
      "You are judging a hackathon project on DEMO QUALITY. Is there a working demo a " +
      "stranger could try right now? Is the video clear, short, and self-explanatory? " +
      "Reward projects with hosted demos, deep links to the interesting flow, and well- " +
      "edited videos. Penalize broken links, missing demos, and confusing onboarding. " +
      "Respond with a single integer score from 0 to 10 followed by exactly one paragraph " +
      "of reasoning. Format your answer as: 'SCORE: <int>\\nREASONING: <one paragraph>'.",
  },
  {
    key: "originality",
    weight: 0.1,
    prompt:
      "You are judging a hackathon project on ORIGINALITY. Is this a novel angle, a fresh " +
      "combination of tools, or a remix of something obvious? Reward genuinely surprising " +
      "ideas and unexpected applications. Penalize me-too clones of well-known products " +
      "with no twist. Respond with a single integer score from 0 to 10 followed by exactly " +
      "one paragraph of reasoning. Format your answer as: 'SCORE: <int>\\nREASONING: <one paragraph>'.",
  },
  {
    key: "code_quality",
    weight: 0.1,
    prompt:
      "You are judging a hackathon project on CODE QUALITY. Looking at the README, file " +
      "structure, and commit history: is the codebase well-organized, documented, and " +
      "maintainable? Are there any tests? Reward clean structure, clear naming, and " +
      "evidence of care. Penalize spaghetti, no documentation, and obvious AI-generated " +
      "boilerplate with no human review. Respond with a single integer score from 0 to 10 " +
      "followed by exactly one paragraph of reasoning. Format your answer as: " +
      "'SCORE: <int>\\nREASONING: <one paragraph>'.",
  },
] as const;

export type RubricKey = (typeof RUBRIC)[number]["key"];

// =============================================================================
// Types
// =============================================================================

interface DimensionResult {
  score: number;
  reasoning: string;
}

type DimensionResults = Record<RubricKey, DimensionResult>;

interface RepoSnapshot {
  defaultBranchSha: string;
  readme: string | null;
  topCommitMessages: string[];
  integrationCounts: Record<string, number>;
  raw?: unknown;
}

interface NebiusJudgeArgs {
  prompt: string;
  evidence: string;
  seed: number;
  rubricKey: string;
}

interface NebiusJudgeResult {
  score: number;
  reasoning: string;
}

// =============================================================================
// Helpers
// =============================================================================

function parseGithubRepo(repoUrl: string | null | undefined):
  | { owner: string; repo: string }
  | null {
  if (!repoUrl) return null;
  // Match https://github.com/<owner>/<repo>(.git)? with optional trailing slash.
  const match = repoUrl.match(
    /^https?:\/\/(?:www\.)?github\.com\/([^/\s]+)\/([^/\s?#.]+)(?:\.git)?\/?$/i,
  );
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

function deterministicSeed(submissionId: string, rubricKey: string): number {
  const hash = createHash("sha256").update(`${submissionId}:${rubricKey}`).digest();
  // Take 4 bytes -> uint32, mask to 31 bits to keep it positive within 2^31.
  const u32 = hash.readUInt32BE(0);
  return u32 & 0x7fffffff;
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 10) return 10;
  return Math.round(value);
}

function buildEvidencePack(args: {
  projectName: string;
  summary: string | null;
  repoUrl: string | null;
  demoUrl: string | null;
  videoUrl: string | null;
  snapshot: RepoSnapshot;
}): string {
  const readme = (args.snapshot.readme ?? "").slice(0, 6_000);
  const top = args.snapshot.topCommitMessages.slice(0, 3);
  const counts = args.snapshot.integrationCounts ?? {};
  const integrationsLine =
    Object.keys(counts).length === 0
      ? "(none detected)"
      : Object.entries(counts)
          .map(([k, v]) => `${k}=${v}`)
          .join(", ");

  return [
    `PROJECT: ${args.projectName}`,
    `SUMMARY: ${args.summary ?? "(no summary)"}`,
    `REPO: ${args.repoUrl ?? "(none)"}`,
    `DEMO: ${args.demoUrl ?? "(none)"}`,
    `VIDEO: ${args.videoUrl ?? "(none)"}`,
    `INTEGRATIONS: ${integrationsLine}`,
    `TOP COMMITS:`,
    ...top.map((c) => `  - ${c}`),
    `README (first 6kb):`,
    readme || "(empty)",
  ].join("\n");
}

async function judgeOneDimension(
  rubric: (typeof RUBRIC)[number],
  evidence: string,
  submissionId: string,
): Promise<DimensionResult> {
  const seed = deterministicSeed(submissionId, rubric.key);

  const callOnce = (): Promise<NebiusJudgeResult> =>
    (nebiusJudge as (args: NebiusJudgeArgs) => Promise<NebiusJudgeResult>)({
      prompt: rubric.prompt,
      evidence,
      seed,
      rubricKey: rubric.key,
    });

  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await callOnce();
      return {
        score: clampScore(result.score),
        reasoning: String(result.reasoning ?? "").slice(0, 4_000),
      };
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error(`nebiusJudge failed for ${rubric.key}`);
}

function aggregateDimensions(results: DimensionResults): number {
  // Weighted mean of 0..10 dimension scores, multiplied by 10 -> 0..100.
  let weighted = 0;
  for (const r of RUBRIC) {
    const dim = results[r.key];
    weighted += dim.score * r.weight;
  }
  return Math.round(weighted * 10 * 100) / 100;
}

function topReasonings(results: DimensionResults, n = 2): string[] {
  return [...RUBRIC]
    .map((r) => ({ key: r.key, ...results[r.key] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((r) => `${r.key}: ${r.reasoning}`);
}

// =============================================================================
// Composite + ranks
// =============================================================================

const AI_WEIGHT = 0.4;
const SPONSOR_WEIGHT = 0.4;
const INVESTOR_WEIGHT = 0.2;

/**
 * Compute the composite score from the three component pieces.
 *
 * Formula: 0.4*ai + 0.4*sponsorAvg + 0.2*investorAvg, with missing components
 * dropping out and the remaining weights rescaled so they still sum to 1.
 */
export function computeComposite(input: {
  ai: number | null;
  sponsorAvg: number | null;
  investorAvg: number | null;
}): number | null {
  const components: Array<{ value: number; weight: number }> = [];
  if (input.ai != null) components.push({ value: input.ai, weight: AI_WEIGHT });
  if (input.sponsorAvg != null)
    components.push({ value: input.sponsorAvg, weight: SPONSOR_WEIGHT });
  if (input.investorAvg != null)
    components.push({ value: input.investorAvg, weight: INVESTOR_WEIGHT });
  if (components.length === 0) return null;
  const totalWeight = components.reduce((s, c) => s + c.weight, 0);
  if (totalWeight === 0) return null;
  const sum = components.reduce((s, c) => s + c.value * (c.weight / totalWeight), 0);
  return Math.round(sum * 100) / 100;
}

/**
 * Recompute composite_rank for every project in an event in a single pass,
 * ordering by composite_score desc with NULLs last.
 *
 * Exported for reuse by judging.upsertScore in the tRPC router.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function recomputeRanks(eventId: string, tx: any): Promise<void> {
  // Single SQL update; row_number() partitioned over the event ranks projects
  // by composite_score desc, with nulls last so unscored projects sort to the
  // bottom. Drizzle-ish raw SQL keeps this portable across the .transaction()
  // and the top-level db handle.
  await tx.execute(sql`
    WITH ranked AS (
      SELECT id,
             ROW_NUMBER() OVER (
               ORDER BY composite_score DESC NULLS LAST, created_at ASC
             ) AS rk
        FROM projects
       WHERE event_id = ${eventId}
    )
    UPDATE projects p
       SET composite_rank = r.rk
      FROM ranked r
     WHERE p.id = r.id
  `);
}

// =============================================================================
// scoreSubmission — the heart of the AI judging pipeline.
// =============================================================================

export interface ScoreSubmissionOutcome {
  status: "scored" | "failed";
  submissionId: string;
  aiScore?: number;
  reason?: string;
}

export async function scoreSubmission(
  submissionId: string,
  db: Db = defaultDb,
): Promise<ScoreSubmissionOutcome> {
  // 1. Load submission + project.
  const sub = await db.query.submissions.findFirst({
    where: eq(submissions.id, submissionId),
    with: { project: true },
  });

  if (!sub) {
    return {
      status: "failed",
      submissionId,
      reason: "submission not found",
    };
  }

  const project = sub.project;
  const repoUrl = project?.repoUrl ?? null;
  const parsedRepo = parseGithubRepo(repoUrl);

  if (!parsedRepo) {
    await markFailed(
      db,
      submissionId,
      repoUrl
        ? `Could not parse a GitHub owner/repo from repoUrl '${repoUrl}'.`
        : "Project has no repoUrl set.",
    );
    return {
      status: "failed",
      submissionId,
      reason: "missing or invalid repoUrl",
    };
  }

  // 2. Snapshot the repo (Token Factory / GitHub calls happen OUTSIDE the tx).
  let snapshot: RepoSnapshot;
  try {
    snapshot = (await (
      snapshotRepo as (args: { owner: string; repo: string }) => Promise<RepoSnapshot>
    )(parsedRepo)) as RepoSnapshot;
  } catch (err) {
    const reason = err instanceof Error ? err.message : "github snapshot failed";
    await markFailed(db, submissionId, `GitHub snapshot failed: ${reason}`);
    return { status: "failed", submissionId, reason };
  }

  // 3. Build evidence pack.
  const evidence = buildEvidencePack({
    projectName: project?.name ?? "(unknown)",
    summary: project?.summary ?? null,
    repoUrl,
    demoUrl: project?.demoUrl ?? null,
    videoUrl: project?.videoUrl ?? null,
    snapshot,
  });

  // 4. Score every rubric dimension in parallel (each tolerates one retry).
  let results: DimensionResults;
  try {
    const settled = await Promise.all(
      RUBRIC.map((r) => judgeOneDimension(r, evidence, submissionId)),
    );
    results = RUBRIC.reduce<Partial<DimensionResults>>((acc, r, i) => {
      acc[r.key] = settled[i];
      return acc;
    }, {}) as DimensionResults;
  } catch (err) {
    const reason = err instanceof Error ? err.message : "nebius judge failed";
    await markFailed(db, submissionId, `AI judge failed: ${reason}`);
    return { status: "failed", submissionId, reason };
  }

  const aiScore = aggregateDimensions(results);
  const aiSummary = topReasonings(results, 2).join(" • ").slice(0, 2_000);

  const eventId = project!.eventId;

  // 5. Single transaction: write score, update project, recompute ranks,
  //    mark submission scored, audit log.
  await db.transaction(async (tx) => {
    const scoresJson: Record<string, DimensionResult> = {};
    for (const r of RUBRIC) scoresJson[r.key] = results[r.key];

    await tx.insert(judgeScores).values({
      submissionId,
      judgeId: null,
      judgeKind: "ai",
      scoresJson: scoresJson as unknown as Record<string, number>,
      weighted: aiScore.toFixed(2),
      notes: null,
    });

    // Composite recompute. Pull current human/sponsor/investor avgs.
    const humanAvg = await fetchHumanAverages(tx, project!.id);
    const composite = computeComposite({
      ai: aiScore,
      sponsorAvg: humanAvg.sponsorAvg,
      investorAvg: humanAvg.investorAvg,
    });

    await tx
      .update(projects)
      .set({
        aiScore: aiScore.toFixed(2),
        compositeScore: composite != null ? composite.toFixed(2) : null,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, project!.id));

    await recomputeRanks(eventId, tx);

    await tx
      .update(submissions)
      .set({
        status: "scored",
        aiSummary,
        scoredAt: new Date(),
      })
      .where(eq(submissions.id, submissionId));

    await tx.insert(auditLog).values({
      actorId: null,
      action: "submission.scored",
      targetType: "submission",
      targetId: submissionId,
      metadata: {
        aiScore,
        composite,
        rubricVersion: RUBRIC_VERSION,
        dimensions: Object.fromEntries(
          RUBRIC.map((r) => [r.key, results[r.key].score]),
        ),
      },
    });
  });

  return { status: "scored", submissionId, aiScore };
}

// =============================================================================
// Internal helpers
// =============================================================================

async function markFailed(db: Db, submissionId: string, reason: string) {
  await db
    .update(submissions)
    .set({ status: "failed", aiSummary: reason })
    .where(eq(submissions.id, submissionId));

  await db.insert(auditLog).values({
    actorId: null,
    action: "submission.score_failed",
    targetType: "submission",
    targetId: submissionId,
    metadata: { reason },
  });
}

interface HumanAverages {
  sponsorAvg: number | null;
  investorAvg: number | null;
}

/**
 * Pull the sponsor and investor (angel + vc) average weighted scores across
 * every submission for a given project. Returns null if a category has no
 * scores yet.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchHumanAverages(tx: any, projectId: string): Promise<HumanAverages> {
  const rows = await tx
    .select({
      kind: judgeScores.judgeKind,
      avg: sql<string>`avg(${judgeScores.weighted})`.as("avg"),
    })
    .from(judgeScores)
    .innerJoin(submissions, eq(submissions.id, judgeScores.submissionId))
    .where(
      and(
        eq(submissions.projectId, projectId),
        sql`${judgeScores.judgeKind} <> 'ai'`,
      ),
    )
    .groupBy(judgeScores.judgeKind);

  let sponsorAvg: number | null = null;
  const investorVals: number[] = [];
  for (const row of rows as Array<{ kind: string; avg: string | null }>) {
    if (row.avg == null) continue;
    const v = Number(row.avg);
    if (!Number.isFinite(v)) continue;
    if (row.kind === "sponsor") {
      sponsorAvg = v;
    } else if (row.kind === "angel" || row.kind === "vc") {
      investorVals.push(v);
    }
  }
  const investorAvg =
    investorVals.length === 0
      ? null
      : investorVals.reduce((s, x) => s + x, 0) / investorVals.length;
  return { sponsorAvg, investorAvg };
}

