import { TRPCError, t } from "@/server/api/trpc/init";
import { timingMiddleware } from "@/server/api/trpc/middleware";

// Public (unauthenticated) procedure
export const publicProcedure = t.procedure.use(timingMiddleware);

// Protected (authenticated) procedure
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });

// Protected (admin-only) procedure
export const adminProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (ctx.session?.user?.role !== "ADMIN") {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });
