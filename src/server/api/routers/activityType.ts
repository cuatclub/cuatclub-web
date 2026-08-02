import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { getTRPCError } from "@/utils/error";
import { activityTypeServiceImpl } from "@/server/api/service/activityType.service";
import { CreateActivityTypeRequestSchema, UpdateActivityTypeRequestSchema } from "@/server/api/dto/activityType.dto";
import { eq } from "drizzle-orm";
import { activityType } from "@/server/db/activityType";
import { z } from "zod";

export const activityTypeRouter = createTRPCRouter({
    getAll: publicProcedure.query(async () => {
        const [res, error] = await activityTypeServiceImpl.getByFilter()
        if (error) throw new TRPCError(getTRPCError(error))
        return res
    }),

    create: protectedProcedure
        .input(CreateActivityTypeRequestSchema)
        .mutation(async ({ input }) => {
            const [res, error] = await activityTypeServiceImpl.create(input)
            if (error) return new TRPCError(getTRPCError(error))
            return res
        }),

    update: protectedProcedure
        .input(UpdateActivityTypeRequestSchema)
        .mutation(async ({ input }) => {
            const res = await activityTypeServiceImpl.update(eq(activityType.id, input.id), input)
            if (res) return new TRPCError(getTRPCError(res))
            return null
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ input }) => {
            const res = await activityTypeServiceImpl.delete(eq(activityType.id, input.id))
            if (res) return new TRPCError(getTRPCError(res))
            return null
        }),
})