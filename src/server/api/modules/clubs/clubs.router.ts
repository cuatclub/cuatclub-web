import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { createClub, listClubs, getClubById, updateClub, deleteClub } from "@/server/api/modules/clubs/usecases";
import {
	CreateClubInputDTOSchema,
	CreateClubOutputDTOSchema,
	UpdateClubInputDTOSchema,
	UpdateClubOutputDTOSchema,
	DeleteClubInputDTOSchema,
	DeleteClubOutputDTOSchema,
	GetClubByIdInputDTOSchema,
	GetClubByIdOutputDTOSchema,
	ListClubsInputDTOSchema,
	ListClubsOutputDTOSchema,
} from "@/server/api/modules/clubs/dto";

export const clubsRouter = createTRPCRouter({
	create: protectedProcedure
		.input(CreateClubInputDTOSchema)
		.output(CreateClubOutputDTOSchema)
		.mutation(async ({ input, ctx }) => createClub(input, ctx.session.user.id)),

	list: publicProcedure
		.input(ListClubsInputDTOSchema)
		.output(ListClubsOutputDTOSchema)
		.query(async () => listClubs()),

	getById: publicProcedure
		.input(GetClubByIdInputDTOSchema)
		.output(GetClubByIdOutputDTOSchema)
		.query(async ({ input }) => getClubById(input)),

	update: protectedProcedure
		.input(UpdateClubInputDTOSchema)
		.output(UpdateClubOutputDTOSchema)
		.mutation(async ({ input, ctx }) => updateClub(input, ctx.session.user.id)),

	delete: protectedProcedure
		.input(DeleteClubInputDTOSchema)
		.output(DeleteClubOutputDTOSchema)
		.mutation(async ({ input, ctx }) => deleteClub(input, ctx.session.user.id)),
});
