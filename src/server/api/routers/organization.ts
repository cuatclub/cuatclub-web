import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { organizationServiceImpl } from "@/server/api/service/organization.service";
import {
	CreateOrganizationRequestSchema,
	DiscoverClubsRequestSchema,
	SetMineInterestsStepSchema,
	UpdateMineInfoStepSchema,
	UpdateMineSocialsStepSchema,
	UpdateOrganizationRequestSchema,
} from "@/server/api/dto/organization.dto";
import { getTRPCError } from "@/utils/error";
import { TRPCError } from "@trpc/server";
import { organization } from "@/server/db/organization";
import { eq } from "drizzle-orm";

export const organizationRouter = createTRPCRouter({
	create: protectedProcedure.input(CreateOrganizationRequestSchema).mutation(async ({ input }) => {
		const [res, error] = await organizationServiceImpl.create(input);
		if (error) return new TRPCError(getTRPCError(error));
		return res;
	}),

	update: protectedProcedure.input(UpdateOrganizationRequestSchema).mutation(async ({ input }) => {
		const { id, ...rest } = input;
		const res = await organizationServiceImpl.update(eq(organization.id, id), rest);
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
			const res = await organizationServiceImpl.delete(eq(organization.id, input.id));
			if (res) return new TRPCError(getTRPCError(res));
			return null;
		}),

	getOne: publicProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ input }) => {
			const [res, error] = await organizationServiceImpl.getOneByFilter(eq(organization.id, input.id));
			if (error) return new TRPCError(getTRPCError(error));
			return res;
		}),

	getAll: publicProcedure
		.query(async () => {
			const [res, error] = await organizationServiceImpl.getByFilter();
			if (error) return new TRPCError(getTRPCError(error));
			return res;
		}),

	/**
	 * Backs the `/clubs` discovery grid. Public: logged-out visitors get results, with
	 * `isFollowing: false` throughout. Unlike `getAll`, this excludes banned and EVENT-category
	 * rows and returns no owner `user` record.
	 */
	discover: publicProcedure.input(DiscoverClubsRequestSchema).query(async ({ ctx, input }) => {
		const [res, error] = await organizationServiceImpl.discoverClubs(
			input,
			ctx.session?.user?.id ?? null,
		);
		if (error) throw new TRPCError(getTRPCError(error));
		return res!;
	}),

	getMine: protectedProcedure.query(async ({ ctx }) => {
		const [data, error] = await organizationServiceImpl.getMineByUserId(ctx.session.user.id);
		if (error) throw new TRPCError(getTRPCError(error));
		return data;
	}),

	ensureMine: protectedProcedure.mutation(async ({ ctx }) => {
		const [data, error] = await organizationServiceImpl.ensureMineForUser(ctx.session.user.id);
		if (error) throw new TRPCError(getTRPCError(error));
		return data!;
	}),

	updateMineInfo: protectedProcedure.input(UpdateMineInfoStepSchema).mutation(async ({ ctx, input }) => {
		const err = await organizationServiceImpl.updateMineInfo(ctx.session.user.id, input);
		if (err) throw new TRPCError(getTRPCError(err));
		return null;
	}),

	updateMineSocials: protectedProcedure.input(UpdateMineSocialsStepSchema).mutation(async ({ ctx, input }) => {
		const err = await organizationServiceImpl.updateMineSocials(ctx.session.user.id, input);
		if (err) throw new TRPCError(getTRPCError(err));
		return null;
	}),

	setMineInterests: protectedProcedure.input(SetMineInterestsStepSchema).mutation(async ({ ctx, input }) => {
		const err = await organizationServiceImpl.setMineInterests(ctx.session.user.id, input.interestIds);
		if (err) throw new TRPCError(getTRPCError(err));
		return null;
	}),
});
