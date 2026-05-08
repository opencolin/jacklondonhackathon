import "server-only";

import { env } from "@/server/env";
import { fetchWithTimeout } from "@/server/lib/fetch-with-timeout";

export class NebiusError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = "NebiusError";
    this.status = status;
    this.body = body;
  }
}

export interface NebiusJudgeOpts {
  /** Override the default judge model. */
  model?: string;
  /** Optional deterministic seed (Nebius/OpenAI-compatible API). */
  seed?: number;
  /** Optional system prompt prepended to the message list. */
  system?: string;
  /** Override the per-request timeout. */
  timeoutMs?: number;
  /** Override sampling temperature (default 0.2). */
  temperature?: number;
  /** Forwarded AbortSignal. */
  signal?: AbortSignal;
}

export interface NebiusJudgeResult {
  score: number;
  reasoning: string;
  /** The raw assistant message content, before JSON parsing. */
  raw: string;
}

interface OpenAIChatChoice {
  message?: { content?: string | null };
}

interface OpenAIChatResponse {
  choices?: OpenAIChatChoice[];
}

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_TEMPERATURE = 0.2;

let warnedMissing = false;
function warnMissingOnce(): void {
  if (warnedMissing) return;
  warnedMissing = true;
  console.warn("[nebius] NEBIUS_TOKEN_FACTORY_KEY is not set; nebiusJudge will throw if called.");
}

function parseJudgePayload(raw: string): { score: number; reasoning: string } {
  // Strip ```json ... ``` or ``` ... ``` fences if present.
  let text = raw.trim();
  const fenceMatch = text.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i);
  if (fenceMatch?.[1]) text = fenceMatch[1].trim();

  // Sometimes models emit prose around the JSON. Find the outermost { ... }.
  if (!text.startsWith("{")) {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) text = text.slice(start, end + 1);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new NebiusError(
      `Could not parse judge output as JSON: ${(err as Error).message}`,
      200,
      raw,
    );
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new NebiusError("Judge output was not a JSON object", 200, raw);
  }

  const obj = parsed as Record<string, unknown>;
  const scoreRaw = obj.score;
  const reasoningRaw = obj.reasoning ?? obj.explanation ?? obj.rationale;

  const score = typeof scoreRaw === "number" ? scoreRaw : Number(scoreRaw);
  if (!Number.isFinite(score)) {
    throw new NebiusError("Judge output missing numeric `score`", 200, raw);
  }

  const reasoning = typeof reasoningRaw === "string" ? reasoningRaw : "";
  return { score, reasoning };
}

/**
 * Run a single chat completion against the Nebius Token Factory using the
 * OpenAI-compatible API. The model is expected to return a JSON object with
 * `score` (number) and `reasoning` (string). Fenced ```json``` blocks are
 * tolerated.
 */
export async function nebiusJudge(
  prompt: string,
  opts: NebiusJudgeOpts = {},
): Promise<NebiusJudgeResult> {
  if (!env.NEBIUS_TOKEN_FACTORY_KEY) {
    warnMissingOnce();
    throw new NebiusError("NEBIUS_TOKEN_FACTORY_KEY is not configured", 0, "");
  }

  const baseUrl = env.NEBIUS_TOKEN_FACTORY_BASE_URL.replace(/\/+$/, "");
  const url = `${baseUrl}/chat/completions`;

  const messages: Array<{ role: "system" | "user"; content: string }> = [];
  if (opts.system) messages.push({ role: "system", content: opts.system });
  messages.push({ role: "user", content: prompt });

  const body: Record<string, unknown> = {
    model: opts.model ?? env.NEBIUS_JUDGE_MODEL,
    messages,
    temperature: opts.temperature ?? DEFAULT_TEMPERATURE,
  };
  if (typeof opts.seed === "number") body.seed = opts.seed;

  const res = await fetchWithTimeout(url, {
    method: "POST",
    timeoutMs: opts.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    signal: opts.signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.NEBIUS_TOKEN_FACTORY_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new NebiusError(
      `Nebius chat/completions failed: ${res.status} ${res.statusText}`,
      res.status,
      text,
    );
  }

  let parsedResp: OpenAIChatResponse;
  try {
    parsedResp = JSON.parse(text) as OpenAIChatResponse;
  } catch (err) {
    throw new NebiusError(
      `Nebius returned non-JSON response: ${(err as Error).message}`,
      res.status,
      text,
    );
  }

  const content = parsedResp.choices?.[0]?.message?.content ?? "";
  if (!content) {
    throw new NebiusError("Nebius response had no message content", res.status, text);
  }

  const { score, reasoning } = parseJudgePayload(content);
  return { score, reasoning, raw: content };
}
