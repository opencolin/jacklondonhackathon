import "server-only";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { asc, eq } from "drizzle-orm";
import { router, publicProcedure } from "@/server/trpc/init";
import { sponsors } from "@/server/db/schema";

export const sponsorsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select()
      .from(sponsors)
      .where(eq(sponsors.status, "active"))
      .orderBy(asc(sponsors.name));
    return rows;
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(sponsors)
        .where(eq(sponsors.id, input.id))
        .limit(1);
      const sponsor = rows[0];
      if (!sponsor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sponsor not found",
        });
      }
      return sponsor;
    }),
});
