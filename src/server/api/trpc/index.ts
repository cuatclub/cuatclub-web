export { createTRPCContext, createTRPCRouter, createCallerFactory } from "@/server/api/trpc/init";
export {
  publicProcedure,
  protectedProcedure,
  studentProcedure,
  adminProcedure,
} from "@/server/api/trpc/procedures";
