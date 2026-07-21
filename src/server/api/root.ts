import { postRouter } from "@/server/api/routers/post";
import { interestRouter } from "./routers/interest";
import { interestXPostRouter } from "./routers/interestXPost";
import { calendarItemRouter } from "@/server/api/routers/calendarItem";
import { organizationRouter } from "@/server/api/routers/organization";
import { facultyRouter } from "@/server/api/routers/faculty";
import { userRouter } from "@/server/api/routers/user";
import { uploadRouter } from "@/server/api/routers/upload";
import { activityTypeRouter } from "@/server/api/routers/activityType";
import { userXOrganizationRouter } from "@/server/api/routers/userXOrganization";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  interest: interestRouter,
  interestXPost: interestXPostRouter,
  calendarItem: calendarItemRouter,
  organization: organizationRouter,
  faculty: facultyRouter,
  user: userRouter,
  upload: uploadRouter,
  activityType: activityTypeRouter,
  userXOrganization: userXOrganizationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
