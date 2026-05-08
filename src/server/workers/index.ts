// Worker process entry point.
//
// NOTE: this file intentionally does NOT import "server-only" — it's the
// main module of a separate Node process started by `pnpm worker`, not a
// Next.js server module.

import { Worker, type Job } from "bullmq";
import IORedis from "ioredis";
import { isNotNull } from "drizzle-orm";

import { db, client as dbClient } from "@/server/db";
import { events, auditLog } from "@/server/db/schema";
import { env } from "@/server/env";
import { discord } from "@/server/integrations/discord";
import { mailer } from "@/server/integrations/resend";
import { materializeOfficeHoursForEvent } from "@/server/services/calendar";
import { scoreSubmission } from "@/server/services/judging";
import {
  type DiscordJobData,
  type EmailJobData,
  type JudgeJobData,
} from "@/server/queue";

if (!env.REDIS_URL) {
  console.log("[worker] Redis not configured; worker exiting.");
  process.exit(0);
}

const connection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

const workers: Worker[] = [];

// =============================================================================
// judge worker — runs the AI judging pipeline.
// =============================================================================

const judgeWorker = new Worker<JudgeJobData>(
  "judge",
  async (job: Job<JudgeJobData>) => {
    const start = Date.now();
    const { submissionId } = job.data;
    console.log(`[judge:${job.id}] start submission=${submissionId}`);
    try {
      const result = await scoreSubmission(submissionId, db);
      const ms = Date.now() - start;
      console.log(
        `[judge:${job.id}] done submission=${submissionId} status=${result.status} aiScore=${
          result.aiScore ?? "-"
        } in ${ms}ms`,
      );
      return result;
    } catch (err) {
      const ms = Date.now() - start;
      const reason = err instanceof Error ? err.message : String(err);
      console.error(
        `[judge:${job.id}] fail submission=${submissionId} in ${ms}ms: ${reason}`,
      );
      // Mirror the failure into auditLog so we have a record even if all
      // retries are exhausted.
      try {
        await db.insert(auditLog).values({
          actorId: null,
          action: "worker.judge.failed",
          targetType: "submission",
          targetId: submissionId,
          metadata: {
            attempt: job.attemptsMade + 1,
            jobId: job.id,
            reason,
            durationMs: ms,
          },
        });
      } catch (auditErr) {
        console.error("[judge] auditLog insert failed:", auditErr);
      }
      throw err;
    }
  },
  {
    connection,
    concurrency: 4,
  },
);
workers.push(judgeWorker);

// =============================================================================
// email worker
// =============================================================================

const emailWorker = new Worker<EmailJobData>(
  "email",
  async (job: Job<EmailJobData>) => {
    const start = Date.now();
    console.log(`[email:${job.id}] start subject="${job.data.subject}"`);
    try {
      const result = await mailer.send(job.data);
      const ms = Date.now() - start;
      console.log(`[email:${job.id}] done in ${ms}ms`);
      return result;
    } catch (err) {
      const ms = Date.now() - start;
      console.error(
        `[email:${job.id}] fail in ${ms}ms:`,
        err instanceof Error ? err.message : err,
      );
      throw err;
    }
  },
  { connection, concurrency: 4 },
);
workers.push(emailWorker);

// =============================================================================
// discord worker
// =============================================================================

const discordWorker = new Worker<DiscordJobData>(
  "discord",
  async (job: Job<DiscordJobData>) => {
    const start = Date.now();
    console.log(`[discord:${job.id}] start`);
    try {
      const result = await discord.notify(job.data);
      const ms = Date.now() - start;
      console.log(`[discord:${job.id}] done in ${ms}ms`);
      return result;
    } catch (err) {
      const ms = Date.now() - start;
      console.error(
        `[discord:${job.id}] fail in ${ms}ms:`,
        err instanceof Error ? err.message : err,
      );
      throw err;
    }
  },
  { connection, concurrency: 2 },
);
workers.push(discordWorker);

// =============================================================================
// calendar — cron-style: every 6 hours expand all events with rrule.
// =============================================================================

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

async function runCalendarSweep() {
  const start = Date.now();
  console.log("[calendar] sweep start");
  try {
    const rows = await db
      .select({ id: events.id })
      .from(events)
      .where(isNotNull(events.rrule));
    let inserted = 0;
    for (const row of rows) {
      try {
        const r = await materializeOfficeHoursForEvent(row.id, db);
        inserted += r.inserted;
      } catch (err) {
        console.error(
          `[calendar] materialize ${row.id} failed:`,
          err instanceof Error ? err.message : err,
        );
      }
    }
    const ms = Date.now() - start;
    console.log(
      `[calendar] sweep done events=${rows.length} inserted=${inserted} in ${ms}ms`,
    );
  } catch (err) {
    console.error(
      "[calendar] sweep failed:",
      err instanceof Error ? err.message : err,
    );
  }
}

// Kick once on boot, then on a 6h interval.
const calendarTimer = setInterval(() => {
  void runCalendarSweep();
}, SIX_HOURS_MS);
void runCalendarSweep();

// =============================================================================
// Graceful shutdown
// =============================================================================

let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[worker] received ${signal}, shutting down...`);
  clearInterval(calendarTimer);
  await Promise.allSettled(workers.map((w) => w.close()));
  await connection.quit().catch(() => {
    /* ignore */
  });
  await dbClient.end({ timeout: 5 }).catch(() => {
    /* ignore */
  });
  console.log("[worker] shutdown complete");
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

console.log("[worker] up — queues: judge, email, discord, calendar(cron)");
