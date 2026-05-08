import "server-only";

import { env } from "@/server/env";
import { fetchWithTimeout } from "@/server/lib/fetch-with-timeout";

const SEARCH_URL = "https://api.tavily.com/search";
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_RESULTS = 5;

export class TavilyError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = "TavilyError";
    this.status = status;
    this.body = body;
  }
}

export interface TavilySearchResultItem {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface TavilySearchResult {
  results: TavilySearchResultItem[];
}

export interface TavilySearchOpts {
  maxResults?: number;
  signal?: AbortSignal;
  timeoutMs?: number;
}

interface TavilyApiResponse {
  results?: Array<{
    title?: unknown;
    url?: unknown;
    content?: unknown;
    score?: unknown;
  }>;
}

let warnedMissing = false;
function warnMissingOnce(): void {
  if (warnedMissing) return;
  warnedMissing = true;
  console.warn("[tavily] TAVILY_API_KEY is not set; tavily.search returns empty results.");
}

async function search(
  query: string,
  opts: TavilySearchOpts = {},
): Promise<TavilySearchResult> {
  if (!env.TAVILY_API_KEY) {
    warnMissingOnce();
    return { results: [] };
  }

  const res = await fetchWithTimeout(SEARCH_URL, {
    method: "POST",
    timeoutMs: opts.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    signal: opts.signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: env.TAVILY_API_KEY,
      query,
      max_results: opts.maxResults ?? DEFAULT_MAX_RESULTS,
      search_depth: "basic",
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new TavilyError(
      `Tavily search failed: ${res.status} ${res.statusText}`,
      res.status,
      text,
    );
  }

  let parsed: TavilyApiResponse;
  try {
    parsed = JSON.parse(text) as TavilyApiResponse;
  } catch (err) {
    throw new TavilyError(
      `Tavily returned non-JSON response: ${(err as Error).message}`,
      res.status,
      text,
    );
  }

  const results: TavilySearchResultItem[] = [];
  for (const r of parsed.results ?? []) {
    const title = typeof r.title === "string" ? r.title : "";
    const url = typeof r.url === "string" ? r.url : "";
    const content = typeof r.content === "string" ? r.content : "";
    const score = typeof r.score === "number" ? r.score : Number(r.score);
    if (!url) continue;
    results.push({
      title,
      url,
      content,
      score: Number.isFinite(score) ? score : 0,
    });
  }

  return { results };
}

export const tavily = {
  search,
};
