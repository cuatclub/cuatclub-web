import { TRPCError } from "@trpc/server";
import {
  CreateInterestRequestSchema,
  UpdateInterestRequestSchema,
} from "../dto/interest.dto";
import { interestServiceImpl } from "../service/interest.service";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { getTRPCError } from "@/utils/error";
import { eq } from "drizzle-orm";
import { interest } from "@/server/db/interest";
import z from "zod";

export const interestRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    const [res, error] = await interestServiceImpl.getByFilter();
    if (error) throw new TRPCError(getTRPCError(error));
    return res;
  }),

  create: protectedProcedure
    .input(CreateInterestRequestSchema)
    .mutation(async ({ input }) => {
      const [res, error] = await interestServiceImpl.create(input);
      if (error) return new TRPCError(getTRPCError(error));

      return res;
    }),

  update: protectedProcedure
    .input(UpdateInterestRequestSchema)
    .mutation(async ({ input }) => {
      const res = await interestServiceImpl.update(eq(interest.id, input.id), input);
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
            const res = await interestServiceImpl.delete(eq(interest.id, input.id));
            if (res) return new TRPCError(getTRPCError(res));

      return null;
    }),
});