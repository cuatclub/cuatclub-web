import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { createClub } from "@/server/api/modules/clubs/usecases/create-club.usecase";
import { listClubs } from "@/server/api/modules/clubs/usecases/list-clubs.usecase";
import { getClubById } from "@/server/api/modules/clubs/usecases/get-club-by-id.usecase";
import { updateClub } from "@/server/api/modules/clubs/usecases/update-club.usecase";
import { deleteClub } from "@/server/api/modules/clubs/usecases/delete-club.usecase";
import { CreateClubRequestSchema } from "@/server/api/modules/clubs/dto/create-club.dto";
import { UpdateClubRequestSchema } from "@/server/api/modules/clubs/dto/update-club.dto";
import { DeleteClubRequestSchema } from "@/server/api/modules/clubs/dto/delete-club.dto";
import { GetClubByIdRequestSchema } from "@/server/api/modules/clubs/dto/get-club-by-id.dto";
import { getTRPCError } from "@/server/error";
import { TRPCError } from "@trpc/server";

export const clubsRouter = createTRPCRouter({
	create: protectedProcedure.input(CreateClubRequestSchema).mutation(async ({ input }) => {
		const [res, error] = await createClub(input);
		if (error) throw new TRPCError(getTRPCError(error));
		return res;
	}),

	list: publicProcedure.query(async () => {
		const [res, error] = await listClubs();
		if (error) throw new TRPCError(getTRPCError(error));
		return res;
	}),

	getById: publicProcedure.input(GetClubByIdRequestSchema).query(async ({ input }) => {
		const [res, error] = await getClubById(input);
		if (error) throw new TRPCError(getTRPCError(error));
		return res;
	}),

	update: protectedProcedure.input(UpdateClubRequestSchema).mutation(async ({ input }) => {
		const error = await updateClub(input);
		if (error) throw new TRPCError(getTRPCError(error));
		return null;
	}),

	delete: protectedProcedure.input(DeleteClubRequestSchema).mutation(async ({ input }) => {
		const error = await deleteClub(input);
		if (error) throw new TRPCError(getTRPCError(error));
		return null;
	}),
});
