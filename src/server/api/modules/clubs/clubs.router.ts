import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import {
  getClubById,
  getClubProfile,
  submitProfileRegistration,
} from "@/server/api/modules/clubs/usecases";
import {
  GetClubByIdInputDTOSchema,
  GetClubByIdOutputDTOSchema,
  GetClubProfileInputDTOSchema,
  GetClubProfileOutputDTOSchema,
  SubmitClubProfileRegistrationInputDTOSchema,
  SubmitClubProfileRegistrationOutputDTOSchema,
} from "@/server/api/modules/clubs/dto";

export const clubsRouter = createTRPCRouter({
  getById: publicProcedure
    .input(GetClubByIdInputDTOSchema)
    .output(GetClubByIdOutputDTOSchema)
    .query(async ({ input }) => getClubById(input.clubId)),

  submitClubProfileRegistration: protectedProcedure
    .input(SubmitClubProfileRegistrationInputDTOSchema)
    .output(SubmitClubProfileRegistrationOutputDTOSchema)
    .mutation(async ({ input }) => submitProfileRegistration(input)),

  getClubProfile: protectedProcedure
    .input(GetClubProfileInputDTOSchema)
    .output(GetClubProfileOutputDTOSchema)
    .query(async ({ ctx }) => getClubProfile(ctx.session.user.id)),
});
