import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { calendarItemServiceImpl } from "@/server/api/service/calendarItem.service";
import { CreateCalendarItemRequestSchema, UpdateCalendarItemRequestSchema } from "@/server/api/dto/calendarItem.dto";
import { getTRPCError } from "@/utils/error";
import { TRPCError } from "@trpc/server";
import { calendarItem } from "@/server/db/calendarItem";
import { and, eq, gte, lte } from "drizzle-orm";
import { post } from "@/server/db/post";

export const calendarItemRouter = createTRPCRouter({
	getByMonth: protectedProcedure
		.input(
			z.object({
				month: z.number().gt(0).lt(13),
				year: z.number().gte(0),
			}),
		)
		.query(async ({ ctx, input }) => {
			const startDate = new Date(input.year, input.month - 1, 1);
			const endDate = new Date(input.year, input.month, 0, 23, 59, 59); // day = 0 means the last day of the previous month and we specify 23:59:59 to make it the end of that day.
			const [res, error] = await calendarItemServiceImpl.getByMonth(
				and(eq(calendarItem.userId, ctx.session.user.id), gte(post.date, startDate), lte(post.date, endDate)),
			);

			if (error) throw new TRPCError(getTRPCError(error));
			return res;
		}),

	getOneByUserId: protectedProcedure.query(async ({ ctx }) => {
			const [res, error] = await calendarItemServiceImpl.getOneByUserId(
				eq(calendarItem.userId, ctx.session.user.id),
			);
			if (error) throw new TRPCError(getTRPCError(error));
			return res;
	}),

	getAllByUserId: protectedProcedure.query(async ({ ctx }) => {
			const [res, error] = await calendarItemServiceImpl.getAllByUserId(
				eq(calendarItem.userId, ctx.session.user.id),
			);
			if (error) throw new TRPCError(getTRPCError(error));
			return res;
	}),

	create: protectedProcedure.input(CreateCalendarItemRequestSchema).mutation(async ({ ctx, input }) => {
		const [res, error] = await calendarItemServiceImpl.create({
			...input,
			userId: ctx.session.user.id,
		});
		if (error) throw new TRPCError(getTRPCError(error));
		return res;
	}),

	update: protectedProcedure.input(UpdateCalendarItemRequestSchema).mutation(async ({ ctx, input }) => {
		const [res, error] = await calendarItemServiceImpl.update(
			and(eq(calendarItem.id, input.id), eq(calendarItem.userId, ctx.session.user.id))!,
			input,
		);
		if (error) throw new TRPCError(getTRPCError(error));
		return res;
	}),

	delete: protectedProcedure
		.input(
			z.object({
				id: z.string().uuid(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const res = await calendarItemServiceImpl.delete(
				and(eq(calendarItem.id, input.id), eq(calendarItem.userId, ctx.session.user.id))!,
			);
			if (res) throw new TRPCError(getTRPCError(res));
			return null;
		}),
});
