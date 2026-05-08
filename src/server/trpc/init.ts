import "server-only";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users, judges, sponsorAdmins } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export type ContextOptions = {
  headers: Headers;
};

export async function createContext({ headers }: ContextOptions) {
  const session = await auth();
  let dbUser: typeof users.$inferSelect | null = null;
  let judgeKinds: ("ai" | "sponsor" | "angel" | "vc")[] = [];
  let sponsorIds: string[] = [];

  if (session?.user?.id) {
    const userRow = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);
    dbUser = userRow[0] ?? null;

    if (dbUser) {
      const judgeRows = await db
        .select({ kind: judges.kind })
        .from(judges)
        .where(eq(judges.userId, dbUser.id));
      judgeKinds = judgeRows.map((r) => r.kind);

      const sponsorRows = await db
        .select({ sponsorId: sponsorAdmins.sponsorId })
        .from(sponsorAdmins)
        .where(eq(sponsorAdmins.userId, dbUser.id));
      sponsorIds = sponsorRows.map((r) => r.sponsorId);
    }
  }

  return {
    headers,
    db,
    session,
    user: dbUser,
    judgeKinds,
    sponsorIds,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Sign in required" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const judgeProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user || ctx.judgeKinds.length === 0) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Judges only" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user?.isAdmin) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const sponsorAdminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user || ctx.sponsorIds.length === 0) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Sponsor admins only" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});
