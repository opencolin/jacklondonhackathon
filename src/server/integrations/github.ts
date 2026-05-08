import "server-only";

import { App } from "@octokit/app";
import { Webhooks } from "@octokit/webhooks";

import { env } from "@/server/env";

export class GithubError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "GithubError";
    this.status = status;
  }
}

const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs"];
const MAX_TREE_PATHS = 200;
const MAX_GREP_FILES = 30;
const MAX_FILE_BYTES = 256 * 1024; // contents endpoint limit; bail above this

let warnedMissingApp = false;
function warnMissingAppOnce(): void {
  if (warnedMissingApp) return;
  warnedMissingApp = true;
  console.warn(
    "[github] GITHUB_APP_ID / GITHUB_APP_PRIVATE_KEY not set; getAppOctokit and snapshotRepo will throw if called.",
  );
}

let warnedMissingWebhook = false;
function warnMissingWebhookOnce(): void {
  if (warnedMissingWebhook) return;
  warnedMissingWebhook = true;
  console.warn(
    "[github] GITHUB_APP_WEBHOOK_SECRET is not set; verifyGithubSignature will return false.",
  );
}

let appCache: App | null = null;
function getApp(): App {
  if (!env.GITHUB_APP_ID || !env.GITHUB_APP_PRIVATE_KEY) {
    warnMissingAppOnce();
    throw new GithubError("GITHUB_APP_ID / GITHUB_APP_PRIVATE_KEY are not configured");
  }
  if (appCache) return appCache;
  // Replace literal "\n" if the key was provided with escaped newlines (env var format).
  const privateKey = env.GITHUB_APP_PRIVATE_KEY.includes("\\n")
    ? env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, "\n")
    : env.GITHUB_APP_PRIVATE_KEY;
  appCache = new App({
    appId: env.GITHUB_APP_ID,
    privateKey,
  });
  return appCache;
}

/**
 * Returns an Octokit instance authenticated as the app, or as a specific
 * installation if `installationId` is provided.
 */
export async function getAppOctokit(installationId?: number) {
  const app = getApp();
  if (typeof installationId === "number") {
    return app.getInstallationOctokit(installationId);
  }
  return app.octokit;
}

interface GetInstallationOpts {
  owner: string;
  repo: string;
}

/**
 * Look up the installation ID for a given repo. Returns null if the app
 * is not installed on that repo.
 */
export async function getInstallationForRepo(
  opts: GetInstallationOpts,
): Promise<number | null> {
  const app = getApp();
  try {
    const { data } = await app.octokit.request("GET /repos/{owner}/{repo}/installation", {
      owner: opts.owner,
      repo: opts.repo,
    });
    return typeof data.id === "number" ? data.id : null;
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 404) return null;
    throw new GithubError(
      `Failed to get installation for ${opts.owner}/${opts.repo}: ${(err as Error).message}`,
      status,
    );
  }
}

export interface SnapshotRepoOpts {
  owner: string;
  repo: string;
  ref?: string;
}

export interface RepoFileTreeEntry {
  path: string;
  type: "file" | "dir";
  size?: number;
}

export interface RepoCommitEntry {
  sha: string;
  message: string;
  authorLogin: string;
  date: string;
}

export interface RepoSnapshot {
  sha: string;
  defaultBranch: string;
  readme: string | null;
  packageJson: unknown | null;
  fileTree: RepoFileTreeEntry[];
  recentCommits: RepoCommitEntry[];
  integrationGreps: { nebius: number; composio: number; tavily: number };
}

interface OctokitLike {
  request: (route: string, params?: Record<string, unknown>) => Promise<{ data: unknown }>;
}

async function fetchRepoMeta(
  octokit: OctokitLike,
  owner: string,
  repo: string,
): Promise<{ defaultBranch: string }> {
  const { data } = await octokit.request("GET /repos/{owner}/{repo}", { owner, repo });
  const obj = data as { default_branch?: unknown };
  const defaultBranch = typeof obj.default_branch === "string" ? obj.default_branch : "main";
  return { defaultBranch };
}

async function fetchRefSha(
  octokit: OctokitLike,
  owner: string,
  repo: string,
  ref: string,
): Promise<string> {
  // Resolve a branch/tag/sha to a concrete commit sha.
  const { data } = await octokit.request("GET /repos/{owner}/{repo}/commits/{ref}", {
    owner,
    repo,
    ref,
  });
  const obj = data as { sha?: unknown };
  if (typeof obj.sha !== "string") throw new GithubError(`Could not resolve ref "${ref}"`);
  return obj.sha;
}

async function fetchTree(
  octokit: OctokitLike,
  owner: string,
  repo: string,
  treeSha: string,
): Promise<RepoFileTreeEntry[]> {
  const { data } = await octokit.request("GET /repos/{owner}/{repo}/git/trees/{tree_sha}", {
    owner,
    repo,
    tree_sha: treeSha,
    recursive: "1",
  });
  const obj = data as { tree?: Array<{ path?: unknown; type?: unknown; size?: unknown }> };
  const entries: RepoFileTreeEntry[] = [];
  for (const item of obj.tree ?? []) {
    if (typeof item.path !== "string") continue;
    const type = item.type === "tree" ? "dir" : item.type === "blob" ? "file" : null;
    if (!type) continue;
    const size = typeof item.size === "number" ? item.size : undefined;
    entries.push({ path: item.path, type, size });
    if (entries.length >= MAX_TREE_PATHS) break;
  }
  return entries;
}

async function fetchFileContent(
  octokit: OctokitLike,
  owner: string,
  repo: string,
  path: string,
  ref: string,
): Promise<string | null> {
  try {
    const { data } = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo,
      path,
      ref,
    });
    if (Array.isArray(data)) return null; // directory
    const obj = data as { content?: unknown; encoding?: unknown; size?: unknown };
    const size = typeof obj.size === "number" ? obj.size : 0;
    if (size > MAX_FILE_BYTES) return null;
    if (typeof obj.content !== "string") return null;
    if (obj.encoding === "base64") {
      return Buffer.from(obj.content, "base64").toString("utf8");
    }
    return obj.content;
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 404) return null;
    throw err;
  }
}

async function fetchRecentCommits(
  octokit: OctokitLike,
  owner: string,
  repo: string,
  ref: string,
): Promise<RepoCommitEntry[]> {
  const { data } = await octokit.request("GET /repos/{owner}/{repo}/commits", {
    owner,
    repo,
    sha: ref,
    per_page: 20,
  });
  const arr = Array.isArray(data) ? data : [];
  const out: RepoCommitEntry[] = [];
  for (const c of arr) {
    const cobj = c as {
      sha?: unknown;
      commit?: { message?: unknown; author?: { date?: unknown } | null } | null;
      author?: { login?: unknown } | null;
    };
    const sha = typeof cobj.sha === "string" ? cobj.sha : "";
    const message = typeof cobj.commit?.message === "string" ? cobj.commit.message : "";
    const authorLogin = typeof cobj.author?.login === "string" ? cobj.author.login : "";
    const date = typeof cobj.commit?.author?.date === "string" ? cobj.commit.author.date : "";
    if (!sha) continue;
    out.push({ sha, message, authorLogin, date });
  }
  return out;
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  const re = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  const matches = haystack.match(re);
  return matches ? matches.length : 0;
}

/**
 * Build a summary snapshot of a repository. Reads README, package.json,
 * a depth-limited file tree, recent commits, and runs simple greps for
 * "nebius" / "composio" / "tavily" against the top files.
 */
export async function snapshotRepo(opts: SnapshotRepoOpts): Promise<RepoSnapshot> {
  const { owner, repo } = opts;
  const installationId = await getInstallationForRepo({ owner, repo });
  // For public repos with no installation, fall back to the app-level Octokit.
  const octokit = (installationId !== null
    ? await getAppOctokit(installationId)
    : await getAppOctokit()) as unknown as OctokitLike;

  const { defaultBranch } = await fetchRepoMeta(octokit, owner, repo);
  const refToUse = opts.ref ?? defaultBranch;
  const sha = await fetchRefSha(octokit, owner, repo, refToUse);

  const [fileTree, readme, packageJsonRaw, recentCommits] = await Promise.all([
    fetchTree(octokit, owner, repo, sha),
    fetchFileContent(octokit, owner, repo, "README.md", sha),
    fetchFileContent(octokit, owner, repo, "package.json", sha),
    fetchRecentCommits(octokit, owner, repo, sha),
  ]);

  let packageJson: unknown | null = null;
  if (packageJsonRaw) {
    try {
      packageJson = JSON.parse(packageJsonRaw);
    } catch {
      packageJson = null;
    }
  }

  // Pick top source files for greps (depth-limited).
  const sourceFiles = fileTree
    .filter((e) => e.type === "file" && SOURCE_EXTENSIONS.some((ext) => e.path.endsWith(ext)))
    .slice(0, MAX_GREP_FILES);

  const sourceContents = await Promise.all(
    sourceFiles.map((e) => fetchFileContent(octokit, owner, repo, e.path, sha)),
  );

  const grepCorpus =
    (readme ?? "") +
    "\n" +
    (packageJsonRaw ?? "") +
    "\n" +
    sourceContents.filter((c): c is string => typeof c === "string").join("\n");

  const integrationGreps = {
    nebius: countOccurrences(grepCorpus, "nebius"),
    composio: countOccurrences(grepCorpus, "composio"),
    tavily: countOccurrences(grepCorpus, "tavily"),
  };

  return {
    sha,
    defaultBranch,
    readme,
    packageJson,
    fileTree,
    recentCommits,
    integrationGreps,
  };
}

let webhooksCache: Webhooks | null = null;
function getWebhooks(): Webhooks | null {
  if (!env.GITHUB_APP_WEBHOOK_SECRET) {
    warnMissingWebhookOnce();
    return null;
  }
  if (webhooksCache) return webhooksCache;
  webhooksCache = new Webhooks({ secret: env.GITHUB_APP_WEBHOOK_SECRET });
  return webhooksCache;
}

/**
 * Verify a `X-Hub-Signature-256` header against the raw request body.
 * Returns false if no webhook secret is configured.
 */
export function verifyGithubSignature(body: string, signature: string): boolean {
  const wh = getWebhooks();
  if (!wh) return false;
  // verify is async in newer versions; we only need the boolean result.
  // It returns a Promise<boolean>, so we wrap with a sync-ish call where possible.
  // Since the signature scheme is HMAC-SHA256 of body with the secret, do it inline
  // to keep this function synchronous.
  return verifyHmacSha256(env.GITHUB_APP_WEBHOOK_SECRET ?? "", body, signature);
}

function verifyHmacSha256(secret: string, body: string, signature: string): boolean {
  if (!signature.startsWith("sha256=")) return false;
  // Use Node's crypto via require to avoid a top-level import in case this
  // ever runs in a non-Node environment.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require("node:crypto") as typeof import("node:crypto");
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(body, "utf8");
  const digest = `sha256=${hmac.digest("hex")}`;
  // Constant-time compare; lengths must match.
  if (digest.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}
