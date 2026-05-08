import "server-only";

import { env } from "@/server/env";
import { fetchWithTimeout } from "@/server/lib/fetch-with-timeout";

const BASE_URL = "https://backend.composio.dev/api/v1";
const DEFAULT_TIMEOUT_MS = 30_000;

export class ComposioError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = "ComposioError";
    this.status = status;
    this.body = body;
  }
}

export interface ComposioVerifyResult {
  apps: string[];
  toolsCalled: string[];
}

export interface VerifyIntegrationOpts {
  owner: string;
  repo: string;
  signal?: AbortSignal;
  timeoutMs?: number;
}

let warnedMissing = false;
function warnMissingOnce(): void {
  if (warnedMissing) return;
  warnedMissing = true;
  console.warn("[composio] COMPOSIO_API_KEY is not set; composio.verifyIntegration is a no-op.");
}

interface ComposioVerifyPayload {
  apps?: unknown;
  toolsCalled?: unknown;
  tools_called?: unknown;
  data?: { apps?: unknown; toolsCalled?: unknown; tools_called?: unknown } | null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const item of value) {
    if (typeof item === "string") out.push(item);
    else if (item && typeof item === "object" && "name" in item && typeof (item as { name: unknown }).name === "string") {
      out.push((item as { name: string }).name);
    }
  }
  return out;
}

async function verifyIntegration(
  opts: VerifyIntegrationOpts,
): Promise<ComposioVerifyResult | null> {
  if (!env.COMPOSIO_API_KEY) {
    warnMissingOnce();
    return null;
  }

  const url = `${BASE_URL}/integrations/verify`;
  const res = await fetchWithTimeout(url, {
    method: "POST",
    timeoutMs: opts.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    signal: opts.signal,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": env.COMPOSIO_API_KEY,
    },
    body: JSON.stringify({ owner: opts.owner, repo: opts.repo }),
  });

  const text = await res.text();
  if (res.status === 404) return null; // best-effort
  if (!res.ok) {
    throw new ComposioError(
      `Composio verifyIntegration failed: ${res.status} ${res.statusText}`,
      res.status,
      text,
    );
  }

  let parsed: ComposioVerifyPayload;
  try {
    parsed = JSON.parse(text) as ComposioVerifyPayload;
  } catch {
    return null;
  }

  const root = parsed.data ?? parsed;
  const apps = asStringArray(root.apps);
  const toolsCalled = asStringArray(root.toolsCalled ?? root.tools_called);

  return { apps, toolsCalled };
}

export const composio = {
  verifyIntegration,
};
