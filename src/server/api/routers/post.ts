import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { postServiceImpl } from "@/server/api/service/post.service";
import { organizationServiceImpl } from "@/server/api/service/organization.service";
import { CreatePostWithInterestsInputSchema, UpdatePostRequestSchema, type CreatePostRequest } from "@/server/api/dto/post.dto";
import { getTRPCError } from "@/utils/error";
import { TRPCError } from "@trpc/server";
import { post } from "@/server/db/post";
import { user } from "@/server/db/auth-schema";
import { and, eq } from "drizzle-orm";

export const postRouter = createTRPCRouter({
	create: protectedProcedure
		.input(CreatePostWithInterestsInputSchema)
		.mutation(async ({ ctx, input }) => {
			const { interestIds, ...postData } = input
			const [org, orgErr] = await organizationServiceImpl.getMineByUserId(ctx.session.user.id)
			if (orgErr) throw new TRPCError(getTRPCError(orgErr))
			if (!org) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "No organization for this account. Finish organization setup before creating a post.",
				})
			}
			const toCreate: CreatePostRequest = {
				...postData,
				organizationId: org.id,
			}
			const [res, error] = await postServiceImpl.create(toCreate, undefined, interestIds)
			if (error) throw new TRPCError(getTRPCError(error))
			return res
		}),

	update: protectedProcedure.input(UpdatePostRequestSchema).mutation(async ({ input }) => {
		const res = await postServiceImpl.update(eq(post.id, input.id), input);
		if (res) return new TRPCError(getTRPCError(res));
		return null;
	}),

	getAll: protectedProcedure.query(async () => {
		const [res, error] = await postServiceImpl.getAll();
		if (error) throw new TRPCError(getTRPCError(error));
		return res;
	}),

	getOne: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ input }) => {
			const [res, error] = await postServiceImpl.getOne(input.id);
			if (error) throw new TRPCError(getTRPCError(error));
			return res;
		}),

	getBySearch: protectedProcedure
		.input(
			z.object({
				searchQuery: z.string().optional(),
				createdByAsc: z.boolean().default(false),
			})
		)
		.query(async ({ input }) => {
			const [res, error] = await postServiceImpl.getBySearch(input);
			if (error) throw new TRPCError(getTRPCError(error));
			return res;
		}),

	getByFilter: protectedProcedure
		.input(
			z.object({
				id: z.string().uuid().optional(),
				userId: z.string().uuid().optional(), // can add more filter
			}),
		)
		.query(async ({ input }) => {
			let filter: ReturnType<typeof and> | ReturnType<typeof eq> | undefined;
			if (input.id && input.userId) {
				filter = and(eq(post.id, input.id), eq(user.id, input.userId));
			} else if (input.id) {
				filter = eq(post.id, input.id);
			} else if (input.userId) {
				filter = eq(user.id, input.userId);
			}
			const [res, error] = await postServiceImpl.getByFilter(filter);
			if (error) throw new TRPCError(getTRPCError(error));
			return res;
		}),

	delete: protectedProcedure
		.input(
			z.object({
				id: z.string().uuid(),
			}),
		)
		.mutation(async ({ input }) => {
			const res = await postServiceImpl.delete(eq(post.id, input.id));
			if (res) return new TRPCError(getTRPCError(res));
			return null;
		}),
});
