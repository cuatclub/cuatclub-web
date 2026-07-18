import { TRPCError } from "@trpc/server";
import {
  CreateInterestXPostRequestSchema,
  UpdateInterestXPostRequestSchema,
} from "../dto/interestXPost.dto";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getTRPCError } from "@/utils/error";
import { eq } from "drizzle-orm";
import { interest } from "@/server/db/interest";
import z from "zod";
import { interestXPostServiceImpl } from "../service/interestXPost.service";
import { interestXPost } from "@/server/db/interestXPost";

export const interestXPostRouter = createTRPCRouter({
  getByPostIds: protectedProcedure
	.input(z.object({ postIds: z.array(z.string().uuid()).min(1).max(1000) }))
	.query(async ({ input }) => {
		const [res, error] = await interestXPostServiceImpl.getByPostIds(input.postIds);
		if (error) throw new TRPCError(getTRPCError(error));
		return res;
	}),

  getAllByPostId: protectedProcedure
    .input(z.object({ postId: z.string().uuid() }))
    .query(async ({ input }) => {
      const [res, error] = await interestXPostServiceImpl.getByFilter(eq(interestXPost.postId, input.postId));
      if (error) throw new TRPCError(getTRPCError(error));
      return res;
    }),

  create: protectedProcedure
    .input(CreateInterestXPostRequestSchema)
    .mutation(async ({ input }) => {
      const [res, error] = await interestXPostServiceImpl.create(input);
      if (error) return new TRPCError(getTRPCError(error));

      return res;
    }),

  update: protectedProcedure
    .input(UpdateInterestXPostRequestSchema)
    .mutation(async ({ input }) => {
      const res = await interestXPostServiceImpl.update(eq(interestXPost.postId, input.postId), input);
      if (res) return new TRPCError(getTRPCError(res));

      return null;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ input }) => {
      const res = await interestXPostServiceImpl.delete(eq(interestXPost.postId, input.id));
      if (res) return new TRPCError(getTRPCError(res));

      return null;
    }),
});
