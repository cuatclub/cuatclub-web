import { categoriesRouter } from "@/server/api/modules/categories/controller";
import { facultiesRouter } from "@/server/api/modules/faculties/controller";
import { invitationCodesRouter } from "@/server/api/modules/invitationCodes/controller";
import { clubsRouter } from "@/server/api/modules/clubs/controller";
import { userRouter } from "@/server/api/routers/user";
import { uploadRouter } from "@/server/api/routers/upload";
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
  user: userRouter,
  upload: uploadRouter,
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
