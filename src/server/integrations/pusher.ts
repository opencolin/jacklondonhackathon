import "server-only";

import Pusher from "pusher";

import { env } from "@/server/env";

export class PusherError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PusherError";
  }
}

export interface PusherTriggerResult {
  delivered: boolean;
}

let warnedMissing = false;
function warnMissingOnce(): void {
  if (warnedMissing) return;
  warnedMissing = true;
  console.warn(
    "[pusher] PUSHER_APP_ID / PUSHER_KEY / PUSHER_SECRET not all set; pusher.trigger is a no-op.",
  );
}

let clientCache: Pusher | null = null;
function getClient(): Pusher | null {
  if (!env.PUSHER_APP_ID || !env.PUSHER_KEY || !env.PUSHER_SECRET) return null;
  if (clientCache) return clientCache;
  clientCache = new Pusher({
    appId: env.PUSHER_APP_ID,
    key: env.PUSHER_KEY,
    secret: env.PUSHER_SECRET,
    cluster: env.PUSHER_CLUSTER,
    useTLS: true,
  });
  return clientCache;
}

async function trigger(
  channel: string | string[],
  event: string,
  data: unknown,
): Promise<PusherTriggerResult> {
  const client = getClient();
  if (!client) {
    warnMissingOnce();
    return { delivered: false };
  }
  await client.trigger(channel, event, data);
  return { delivered: true };
}

export const pusher = {
  trigger,
};
