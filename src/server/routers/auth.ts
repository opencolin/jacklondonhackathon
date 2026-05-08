import "server-only";
import { router, publicProcedure, protectedProcedure } from "@/server/trpc/init";

export const authRouter = router({
  me: protectedProcedure.query(({ ctx }) => {
    return ctx.user;
  }),

  session: publicProcedure.query(({ ctx }) => {
    return {
      user: ctx.user,
      judgeKinds: ctx.judgeKinds,
      sponsorIds: ctx.sponsorIds,
      isAdmin: ctx.user?.isAdmin ?? false,
    };
  }),
});
