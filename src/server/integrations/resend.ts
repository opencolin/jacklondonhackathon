import "server-only";

import { Resend } from "resend";
import type { ReactElement } from "react";

import { env } from "@/server/env";

export class ResendError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ResendError";
    this.status = status;
  }
}

export interface SendEmailOpts {
  to: string | string[];
  subject: string;
  react?: ReactElement;
  html?: string;
  text?: string;
  replyTo?: string;
  from?: string;
}

export interface SendEmailResult {
  id: string | null;
  /** True when no API key is configured and the message was logged instead of sent. */
  noop: boolean;
}

let warnedMissing = false;
function warnMissingOnce(): void {
  if (warnedMissing) return;
  warnedMissing = true;
  console.warn("[resend] RESEND_API_KEY is not set; mailer.send will log payloads instead.");
}

let clientCache: Resend | null = null;
function getClient(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  if (clientCache) return clientCache;
  clientCache = new Resend(env.RESEND_API_KEY);
  return clientCache;
}

async function send(opts: SendEmailOpts): Promise<SendEmailResult> {
  const client = getClient();
  const recipients = Array.isArray(opts.to) ? opts.to : [opts.to];
  const from = opts.from ?? env.RESEND_FROM_EMAIL;

  if (!client) {
    warnMissingOnce();
    console.info(
      "[resend:noop] would send",
      JSON.stringify({ to: recipients, from, subject: opts.subject, hasReact: !!opts.react, hasHtml: !!opts.html, hasText: !!opts.text }),
    );
    return { id: null, noop: true };
  }

  if (!opts.react && !opts.html && !opts.text) {
    throw new ResendError("mailer.send requires one of react, html, or text");
  }

  // The Resend SDK requires either `react`, `html`, or `text`. Build a payload
  // that includes only the populated fields so the SDK's discriminated union
  // is happy.
  const base = {
    from,
    to: recipients,
    subject: opts.subject,
    ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
  };

  const payload = opts.react
    ? { ...base, react: opts.react }
    : opts.html
      ? { ...base, html: opts.html }
      : { ...base, text: opts.text ?? "" };

  // The Resend SDK's `send` method has multiple overload shapes; we cast the
  // narrowed payload to the union the SDK accepts.
  const res = await client.emails.send(payload as Parameters<Resend["emails"]["send"]>[0]);

  if (res.error) {
    throw new ResendError(`Resend send failed: ${res.error.message ?? "unknown"}`);
  }

  return { id: res.data?.id ?? null, noop: false };
}

export const mailer = {
  send,
};
