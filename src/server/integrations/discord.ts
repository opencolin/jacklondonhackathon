import "server-only";

import { env } from "@/server/env";
import { fetchWithTimeout } from "@/server/lib/fetch-with-timeout";

export class DiscordError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = "DiscordError";
    this.status = status;
    this.body = body;
  }
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  footer?: { text: string };
  timestamp?: string;
}

export interface DiscordNotifyOpts {
  content?: string;
  embeds?: DiscordEmbed[];
  username?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
}

let warnedMissing = false;
function warnMissingOnce(): void {
  if (warnedMissing) return;
  warnedMissing = true;
  console.warn("[discord] DISCORD_WEBHOOK_URL is not set; discord.notify is a no-op.");
}

async function notify(opts: DiscordNotifyOpts): Promise<{ delivered: boolean }> {
  if (!env.DISCORD_WEBHOOK_URL) {
    warnMissingOnce();
    return { delivered: false };
  }

  if (!opts.content && (!opts.embeds || opts.embeds.length === 0)) {
    throw new DiscordError("discord.notify requires content or at least one embed", 0, "");
  }

  const body: Record<string, unknown> = {};
  if (opts.content) body.content = opts.content;
  if (opts.embeds && opts.embeds.length > 0) body.embeds = opts.embeds;
  if (opts.username) body.username = opts.username;

  const res = await fetchWithTimeout(env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    timeoutMs: opts.timeoutMs ?? 10_000,
    signal: opts.signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  // Discord webhooks return 204 No Content on success.
  if (!res.ok) {
    const text = await res.text();
    throw new DiscordError(
      `Discord webhook failed: ${res.status} ${res.statusText}`,
      res.status,
      text,
    );
  }

  return { delivered: true };
}

export const discord = {
  notify,
};
