import { clubsRouter } from "@/server/api/modules/clubs/clubs.router";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";


export const appRouter = createTRPCRouter({
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
