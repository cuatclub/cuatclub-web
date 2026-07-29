import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { organizationServiceImpl } from "@/server/api/service/organization.service";
import {
	CreateOrganizationRequestSchema,
	SetMineInterestsStepSchema,
	UpdateMineInfoStepSchema,
	UpdateMineSocialsStepSchema,
	UpdateOrganizationRequestSchema,
} from "@/server/api/dto/organization.dto";
import { getTRPCError } from "@/utils/error";
import { TRPCError } from "@trpc/server";
import { organization } from "@/server/db/organization";
import { and, arrayContains, eq } from "drizzle-orm";

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
			if (error) throw new TRPCError(getTRPCError(error));
			return res;
		}),

	getClub: publicProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ input }) => {
			const [res, error] = await organizationServiceImpl.getOneByFilter(
				and(
					eq(organization.id, input.id),
					arrayContains(organization.categories, ["CLUB"]),
					eq(organization.isBanned, false),
				)!,
			);
			if (error) throw new TRPCError(getTRPCError(error));
			return {
				id: res!.id,
				name: res!.name,
				facultyId: res!.facultyId,
				categories: res!.categories,
				averageHoursPerWeek: res!.averageHoursPerWeek,
				bio: res!.bio,
				recruitmentPeriod: res!.recruitmentPeriod,
				image: res!.image,
				socials: res!.socials,
				createdAt: res!.createdAt,
				updatedAt: res!.updatedAt,
				interests: res!.interests,
			};
		}),

	getAll: publicProcedure.query(async () => {
		const [res, error] = await organizationServiceImpl.getByFilter();
		if (error) throw new TRPCError(getTRPCError(error));
		return res;
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
