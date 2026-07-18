import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { FollowOrganizationRequestSchema } from "@/server/api/dto/userXOrganization.dto";
import { userXOrganizationServiceImpl } from "@/server/api/service/userXOrganization.service";
import { getTRPCError } from "@/utils/error";

export const userXOrganizationRouter = createTRPCRouter({
	follow: protectedProcedure.input(FollowOrganizationRequestSchema).mutation(async ({ ctx, input }) => {
		const [res, error] = await userXOrganizationServiceImpl.follow(
			ctx.session.user.id,
			input.organizationId,
		);
		if (error) throw new TRPCError(getTRPCError(error));
		return res;
	}),

	unfollow: protectedProcedure.input(FollowOrganizationRequestSchema).mutation(async ({ ctx, input }) => {
		const error = await userXOrganizationServiceImpl.unfollow(
			ctx.session.user.id,
			input.organizationId,
		);
		if (error) throw new TRPCError(getTRPCError(error));
		return null;
	}),

	getMineFollowed: protectedProcedure.query(async ({ ctx }) => {
		const [res, error] = await userXOrganizationServiceImpl.getFollowedOrgIds(ctx.session.user.id);
		if (error) throw new TRPCError(getTRPCError(error));
		return res;
	}),
});
