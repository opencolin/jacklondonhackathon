import "server-only";

import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@/server/env";

export class R2Error extends Error {
  constructor(message: string) {
    super(message);
    this.name = "R2Error";
  }
}

export interface R2PutOpts {
  key: string;
  body: Uint8Array | Buffer | string | Blob;
  contentType?: string;
  cacheControl?: string;
}

export interface R2PutResult {
  key: string;
  uploaded: boolean;
}

const DEFAULT_PRESIGN_EXPIRES = 60 * 5; // 5 min

let warnedMissing = false;
function warnMissingOnce(): void {
  if (warnedMissing) return;
  warnedMissing = true;
  console.warn(
    "[r2] R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY not all set; R2 client functions are no-ops.",
  );
}

let clientCache: S3Client | null = null;
function getClient(): S3Client | null {
  if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) return null;
  if (clientCache) return clientCache;
  clientCache = new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
  return clientCache;
}

async function blobToUint8Array(b: Blob): Promise<Uint8Array> {
  const ab = await b.arrayBuffer();
  return new Uint8Array(ab);
}

/**
 * Upload an object to R2. No-op (returns uploaded:false) if R2 is not configured.
 */
export async function r2PutObject(opts: R2PutOpts): Promise<R2PutResult> {
  const client = getClient();
  if (!client) {
    warnMissingOnce();
    return { key: opts.key, uploaded: false };
  }

  let body: Uint8Array | Buffer | string;
  if (typeof Blob !== "undefined" && opts.body instanceof Blob) {
    body = await blobToUint8Array(opts.body);
  } else {
    body = opts.body as Uint8Array | Buffer | string;
  }

  await client.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: opts.key,
      Body: body,
      ContentType: opts.contentType,
      CacheControl: opts.cacheControl,
    }),
  );
  return { key: opts.key, uploaded: true };
}

/**
 * Generate a presigned PUT URL so a client can upload directly to R2.
 * Returns null if R2 is not configured.
 */
export async function r2PresignedPut(
  key: string,
  contentType?: string,
  expiresIn: number = DEFAULT_PRESIGN_EXPIRES,
): Promise<string | null> {
  const client = getClient();
  if (!client) {
    warnMissingOnce();
    return null;
  }
  const cmd = new PutObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(client, cmd, { expiresIn });
}

/**
 * Generate a presigned GET URL so a client can read a private object.
 * Returns null if R2 is not configured.
 */
export async function r2PresignedGet(
  key: string,
  expiresIn: number = DEFAULT_PRESIGN_EXPIRES,
): Promise<string | null> {
  const client = getClient();
  if (!client) {
    warnMissingOnce();
    return null;
  }
  const cmd = new GetObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: key,
  });
  return getSignedUrl(client, cmd, { expiresIn });
}

/**
 * Build the public URL for an object using R2_PUBLIC_BASE_URL. Returns null
 * if no public base URL is configured.
 */
export function r2PublicUrl(key: string): string | null {
  if (!env.R2_PUBLIC_BASE_URL) return null;
  const base = env.R2_PUBLIC_BASE_URL.replace(/\/+$/, "");
  const cleanKey = key.replace(/^\/+/, "");
  return `${base}/${cleanKey}`;
}
