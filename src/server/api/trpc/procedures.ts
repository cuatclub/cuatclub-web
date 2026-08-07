import { t } from "@/server/api/trpc/init";
import { errorHandlingMiddleware } from "@/server/api/trpc/middleware";
import { unauthorized } from "@/server/errors";

const baseProcedure = t.procedure.use(errorHandlingMiddleware);

// Public (unauthenticated) procedure
export const publicProcedure = baseProcedure;

// Protected (authenticated) procedure
export const protectedProcedure = baseProcedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw unauthorized("You must be signed in to do this");
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
    throw unauthorized("You must be an admin to do this");
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});
