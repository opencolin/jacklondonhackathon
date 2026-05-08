import "server-only";
import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
  events,
  eventRegistrations,
} from "@/server/db/schema";
import { env } from "@/server/env";

const CODE_CRUISE_SLUG = "code-cruise";

const providers: NextAuthConfig["providers"] = [];

if (env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: env.AUTH_GITHUB_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
      authorization: { params: { scope: "read:user user:email" } },
    }),
  );
}

if (env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    }),
  );
}

if (env.AUTH_LINKEDIN_ID && env.AUTH_LINKEDIN_SECRET) {
  providers.push(
    LinkedIn({
      clientId: env.AUTH_LINKEDIN_ID,
      clientSecret: env.AUTH_LINKEDIN_SECRET,
    }),
  );
}

if (env.RESEND_API_KEY) {
  providers.push(
    Resend({
      apiKey: env.RESEND_API_KEY,
      from: env.RESEND_FROM_EMAIL,
    }),
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export const authConfig = {
  // The Drizzle adapter typings narrow to SQLite tables in some versions;
  // our schema is Postgres. Cast to silence — runtime is fine.
  adapter: DrizzleAdapter(db as any, {
    usersTable: users as any,
    accountsTable: accounts as any,
    sessionsTable: sessions as any,
    verificationTokensTable: verificationTokens as any,
  }) as any,
  session: { strategy: "database", maxAge: 30 * 24 * 60 * 60 },
  trustHost: true,
  providers,
  pages: {
    signIn: "/builders/login",
    verifyRequest: "/builders/login?check-email=1",
  },
  callbacks: {
    async session({ session, user }: { session: any; user: any }) {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (!user?.id) return;
      try {
        const [event] = await db
          .select({ id: events.id })
          .from(events)
          .where(eq(events.slug, CODE_CRUISE_SLUG))
          .limit(1);
        if (!event) return;
        await db
          .insert(eventRegistrations)
          .values({
            eventId: event.id,
            userId: user.id,
            status: "rsvp",
            source: "builder",
          })
          .onConflictDoNothing({
            target: [eventRegistrations.eventId, eventRegistrations.userId],
          });
      } catch (error) {
        console.error("[auth] auto-RSVP to BuilderShip failed", error);
      }
    },
  },
} satisfies NextAuthConfig;
