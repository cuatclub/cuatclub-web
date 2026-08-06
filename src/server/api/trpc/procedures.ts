import { TRPCError, t } from "@/server/api/trpc/init";
import { timingMiddleware } from "@/server/api/trpc/middleware";
import { errorHandlingMiddleware } from "@/server/api/trpc/error-handling.middleware";

const baseProcedure = t.procedure.use(timingMiddleware).use(errorHandlingMiddleware);

// Public (unauthenticated) procedure
export const publicProcedure = baseProcedure;

// Protected (authenticated) procedure
export const protectedProcedure = baseProcedure.use(({ ctx, next }) => {
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
export const adminProcedure = baseProcedure.use(({ ctx, next }) => {
  if (ctx.session?.user?.role !== "ADMIN") {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});
