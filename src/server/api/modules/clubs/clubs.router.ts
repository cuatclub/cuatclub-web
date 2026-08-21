import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { getAllClubs, getClubById, getClubProfile } from "@/server/api/modules/clubs/usecases";
import {
  GetAllClubsInputDTOSchema,
  GetAllClubsOutputDTOSchema,
  GetClubByIdInputDTOSchema,
  GetClubByIdOutputDTOSchema,
  GetClubProfileInputDTOSchema,
  GetClubProfileOutputDTOSchema,
} from "@/server/api/modules/clubs/dto";

export const clubsRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(GetAllClubsInputDTOSchema)
    .output(GetAllClubsOutputDTOSchema)
    .query(async ({ input }) => getAllClubs(input)),

  getById: publicProcedure
    .input(GetClubByIdInputDTOSchema)
    .output(GetClubByIdOutputDTOSchema)
    .query(async ({ input }) => getClubById(input)),

  getClubProfile: protectedProcedure
    .input(GetClubProfileInputDTOSchema)
    .output(GetClubProfileOutputDTOSchema)
    .query(async ({ ctx }) => getClubProfile(ctx.session.user.id)),
});
