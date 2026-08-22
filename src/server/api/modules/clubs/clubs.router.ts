import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import {
  getClubById,
  getClubProfile,
  saveProfileRegistration,
  submitClubProfileRegistration,
} from "@/server/api/modules/clubs/usecases";
import {
  GetClubByIdInputDTOSchema,
  GetClubByIdOutputDTOSchema,
  GetClubProfileInputDTOSchema,
  GetClubProfileOutputDTOSchema,
  SaveClubProfileRegistrationInputDTOSchema,
  SaveClubProfileRegistrationOutputDTOSchema,
  SubmitClubProfileRegistrationInputDTOSchema,
  SubmitClubProfileRegistrationOutputDTOSchema,
} from "@/server/api/modules/clubs/dto";

export const clubsRouter = createTRPCRouter({
  getById: publicProcedure
    .input(GetClubByIdInputDTOSchema)
    .output(GetClubByIdOutputDTOSchema)
    .query(async ({ input }) => getClubById(input.clubId)),

  saveClubProfileRegistration: protectedProcedure
    .input(SaveClubProfileRegistrationInputDTOSchema)
    .output(SaveClubProfileRegistrationOutputDTOSchema)
    .mutation(async ({ input }) => saveProfileRegistration(input)),

  submitClubProfileRegistration: protectedProcedure
    .input(SubmitClubProfileRegistrationInputDTOSchema)
    .output(SubmitClubProfileRegistrationOutputDTOSchema)
    .mutation(async ({ input }) => submitClubProfileRegistration(input)),

  getClubProfile: protectedProcedure
    .input(GetClubProfileInputDTOSchema)
    .output(GetClubProfileOutputDTOSchema)
    .query(async ({ ctx }) => getClubProfile(ctx.session.user.id)),
});
