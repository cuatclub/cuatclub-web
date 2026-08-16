import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getClubProfile, submitProfileRegistration } from "@/server/api/modules/clubs/usecases";
import {
  GetClubProfileInputDTOSchema,
  GetClubProfileOutputDTOSchema,
  SubmitClubProfileRegistrationInputDTOSchema,
  SubmitClubProfileRegistrationOutputDTOSchema,
} from "@/server/api/modules/clubs/dto";

export const clubsRouter = createTRPCRouter({
  submitClubProfileRegistration: protectedProcedure
    .input(SubmitClubProfileRegistrationInputDTOSchema)
    .output(SubmitClubProfileRegistrationOutputDTOSchema)
    .mutation(async ({ input }) => submitProfileRegistration(input)),

  getClubProfile: protectedProcedure
    .input(GetClubProfileInputDTOSchema)
    .output(GetClubProfileOutputDTOSchema)
    .query(async ({ ctx }) => getClubProfile(ctx.session.user.id)),
});
