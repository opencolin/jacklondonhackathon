import "server-only";
import { auth } from "@/server/auth";
import type { Session } from "next-auth";

/**
 * Like `auth()` but returns null on any error instead of throwing.
 *
 * When `DATABASE_URL` / `AUTH_SECRET` aren't configured (e.g. on a fresh
 * Vercel deploy without env vars set), Auth.js will fail at the adapter
 * layer. Pages that call this just see "no session" and redirect to /login,
 * keeping the marketing site usable.
 */
export async function safeAuth(): Promise<Session | null> {
  try {
    return await auth();
  } catch (err) {
    console.warn(
      "[safeAuth] auth() threw, treating as no session:",
      (err as Error)?.message,
    );
    return null;
  }
}
