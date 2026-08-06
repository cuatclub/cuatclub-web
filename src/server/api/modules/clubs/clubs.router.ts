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
import { ok, ApiResponseSchema } from "@/server/response";

export const clubsRouter = createTRPCRouter({
	create: protectedProcedure
		.input(CreateClubInputDTOSchema)
		.output(ApiResponseSchema(CreateClubOutputDTOSchema))
		.mutation(async ({ input, ctx }) => {
			const res = await createClub(input, ctx.session.user.id);
			return ok(res);
		}),

	list: publicProcedure
		.input(ListClubsInputDTOSchema)
		.output(ApiResponseSchema(ListClubsOutputDTOSchema))
		.query(async () => {
			const res = await listClubs();
			return ok(res);
		}),

	getById: publicProcedure
		.input(GetClubByIdInputDTOSchema)
		.output(ApiResponseSchema(GetClubByIdOutputDTOSchema))
		.query(async ({ input }) => {
			const res = await getClubById(input);
			return ok(res);
		}),

	update: protectedProcedure
		.input(UpdateClubInputDTOSchema)
		.output(ApiResponseSchema(UpdateClubOutputDTOSchema))
		.mutation(async ({ input, ctx }) => {
			const res = await updateClub(input, ctx.session.user.id);
			return ok(res);
		}),

	delete: protectedProcedure
		.input(DeleteClubInputDTOSchema)
		.output(ApiResponseSchema(DeleteClubOutputDTOSchema))
		.mutation(async ({ input, ctx }) => {
			const res = await deleteClub(input, ctx.session.user.id);
			return ok(res);
		}),
});
