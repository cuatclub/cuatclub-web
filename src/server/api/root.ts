import { categoriesRouter } from "@/server/api/modules/categories/categories.router";
import { facultiesRouter } from "@/server/api/modules/faculties/faculties.router";
import { invitationCodesRouter } from "@/server/api/modules/invitation-codes/invitation-codes.router";
import { clubsRouter } from "@/server/api/modules/clubs/clubs.router";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers or /api/modules should be manually added here.
 */
export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  faculties: facultiesRouter,
  invitationCodes: invitationCodesRouter,
  clubs: clubsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.clubs.list();
 *       ^? Club[]
 */
export const createCaller = createCallerFactory(appRouter);
