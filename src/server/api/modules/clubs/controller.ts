import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { registerClub } from "@/server/api/modules/clubs/usecases/registerClub.usecase";
import { getMineClub } from "@/server/api/modules/clubs/usecases/getMineClub.usecase";
import { updateMineClubInfo } from "@/server/api/modules/clubs/usecases/updateMineClubInfo.usecase";
import { setMineClubCategories } from "@/server/api/modules/clubs/usecases/setMineClubCategories.usecase";
import { listClubs } from "@/server/api/modules/clubs/usecases/listClubs.usecase";
import { getClubById } from "@/server/api/modules/clubs/usecases/getClubById.usecase";
import { RegisterClubRequestSchema } from "@/server/api/modules/clubs/dto/registerClub.dto";
import { UpdateMineClubInfoRequestSchema } from "@/server/api/modules/clubs/dto/updateMineClubInfo.dto";
import { SetMineClubCategoriesRequestSchema } from "@/server/api/modules/clubs/dto/setMineClubCategories.dto";
import { ListClubsRequestSchema } from "@/server/api/modules/clubs/dto/listClubs.dto";
import { GetClubByIdRequestSchema } from "@/server/api/modules/clubs/dto/getClubById.dto";
import { getTRPCError } from "@/utils/error";
import { TRPCError } from "@trpc/server";

export const clubsRouter = createTRPCRouter({
	register: publicProcedure.input(RegisterClubRequestSchema).mutation(async ({ ctx, input }) => {
		const [res, error] = await registerClub(input, ctx.headers);
		if (error) throw new TRPCError(getTRPCError(error));
		return res;
	}),

	getMine: protectedProcedure.query(async ({ ctx }) => {
		const [res, error] = await getMineClub(ctx.session.user.id);
		if (error) throw new TRPCError(getTRPCError(error));
		return res;
	}),

	updateMineInfo: protectedProcedure.input(UpdateMineClubInfoRequestSchema).mutation(async ({ ctx, input }) => {
		const error = await updateMineClubInfo(ctx.session.user.id, input);
		if (error) throw new TRPCError(getTRPCError(error));
		return null;
	}),

	setMineCategories: protectedProcedure.input(SetMineClubCategoriesRequestSchema).mutation(async ({ ctx, input }) => {
		const error = await setMineClubCategories(ctx.session.user.id, input.categoryIds);
		if (error) throw new TRPCError(getTRPCError(error));
		return null;
	}),

	list: publicProcedure.input(ListClubsRequestSchema).query(async ({ input }) => {
		const [res, error] = await listClubs(input);
		if (error) throw new TRPCError(getTRPCError(error));
		return res;
	}),

	getById: publicProcedure.input(GetClubByIdRequestSchema).query(async ({ input }) => {
		const [res, error] = await getClubById(input);
		if (error) throw new TRPCError(getTRPCError(error));
		return res;
	}),
});
