import "server-only";

import { Queue, type JobsOptions } from "bullmq";
import IORedis, { type Redis } from "ioredis";

import { env } from "@/server/env";

// =============================================================================
// Job payload shapes
// =============================================================================

export interface JudgeJobData {
  submissionId: string;
}

export interface EmailJobData {
  to: string | string[];
  subject: string;
  template: string;
  data?: Record<string, unknown>;
  text?: string;
  html?: string;
}

export interface DiscordJobData {
  channel?: string;
  content: string;
  embeds?: Array<Record<string, unknown>>;
}

export interface CalendarJobData {
  parentEventId?: string;
}

// =============================================================================
// Queue type — real BullMQ queue or a no-op stub when Redis is missing.
// =============================================================================

interface QueueLike<T> {
  name: string;
  add(name: string, data: T, opts?: JobsOptions): Promise<{ id?: string } | void>;
  close?(): Promise<void>;
}

function createNoopQueue<T>(queueName: string): QueueLike<T> {
  return {
    name: queueName,
    async add(name: string, data: T, opts?: JobsOptions) {
      console.warn(
        `[queue:${queueName}] Redis not configured; dropping job '${name}'`,
        { data, opts },
      );
      return { id: undefined };
    },
    async close() {
      // no-op
    },
  };
}

// =============================================================================
// Connection — lazily created so importing this file in environments without
// Redis (e.g. dev without REDIS_URL set) doesn't crash.
// =============================================================================

let connection: Redis | undefined;

function getConnection(): Redis | undefined {
  if (!env.REDIS_URL) return undefined;
  if (!connection) {
    connection = new IORedis(env.REDIS_URL, {
      // BullMQ requires this to be null so it can manage blocking commands.
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
    });
  }
  return connection;
}

export function getRedisConnection(): Redis | undefined {
  return getConnection();
}

function makeQueue<T>(queueName: string): QueueLike<T> {
  const conn = getConnection();
  if (!conn) return createNoopQueue<T>(queueName);
  return new Queue<T>(queueName, { connection: conn });
}

// =============================================================================
// Public queues
// =============================================================================

export const judgeQueue: QueueLike<JudgeJobData> = makeQueue<JudgeJobData>("judge");
export const emailQueue: QueueLike<EmailJobData> = makeQueue<EmailJobData>("email");
export const discordQueue: QueueLike<DiscordJobData> =
  makeQueue<DiscordJobData>("discord");
export const calendarQueue: QueueLike<CalendarJobData> =
  makeQueue<CalendarJobData>("calendar");

// =============================================================================
// Typed enqueue helpers
// =============================================================================

const DEFAULT_JOB_OPTS: JobsOptions = {
  attempts: 3,
  backoff: { type: "exponential", delay: 5_000 },
  removeOnComplete: { age: 60 * 60 * 24, count: 1000 },
  removeOnFail: { age: 60 * 60 * 24 * 7 },
};

/**
 * Enqueue an AI judging job for a submission.
 *
 * Job id derived from the submission id, so re-enqueueing the same submission
 * is a no-op for as long as the previous job is in the queue / completed set.
 */
export async function enqueueJudgeScore(submissionId: string) {
  return judgeQueue.add(
    "score",
    { submissionId },
    {
      ...DEFAULT_JOB_OPTS,
      jobId: `judge:${submissionId}`,
    },
  );
}

export async function enqueueEmail(payload: EmailJobData, jobIdSuffix?: string) {
  return emailQueue.add("send", payload, {
    ...DEFAULT_JOB_OPTS,
    ...(jobIdSuffix ? { jobId: `email:${jobIdSuffix}` } : {}),
  });
}

export async function enqueueDiscordNotify(
  payload: DiscordJobData,
  jobIdSuffix?: string,
) {
  return discordQueue.add("notify", payload, {
    ...DEFAULT_JOB_OPTS,
    ...(jobIdSuffix ? { jobId: `discord:${jobIdSuffix}` } : {}),
  });
}

/** Tear down all queue connections. Used by the worker on graceful shutdown. */
export async function closeQueues() {
  await Promise.allSettled([
    judgeQueue.close?.(),
    emailQueue.close?.(),
    discordQueue.close?.(),
    calendarQueue.close?.(),
  ]);
  if (connection) {
    await connection.quit().catch(() => {
      /* ignore */
    });
    connection = undefined;
  }
}
