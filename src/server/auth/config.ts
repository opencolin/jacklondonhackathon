import "server-only";
import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/server/db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/server/db/schema";
import { env } from "@/server/env";

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

export const authConfig = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: DrizzleAdapter(db as any, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "database", maxAge: 30 * 24 * 60 * 60 },
  trustHost: true,
  providers,
  pages: {
    signIn: "/builders/login",
    verifyRequest: "/builders/login?check-email=1",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        // expose db user id and admin flag
        session.user.id = user.id;
        // @ts-expect-error -- DrizzleAdapter user type doesn't include is_admin yet
        session.user.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
