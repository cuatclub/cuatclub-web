import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import {
  getClubById,
  getClubProfile,
  getClubLogoUploadUrl,
  getClubImagesUploadUrl,
  saveProfileRegistration,
  submitClubProfileRegistration,
} from "@/server/api/modules/clubs/usecases";
import {
  GetClubByIdInputDTOSchema,
  GetClubByIdOutputDTOSchema,
  GetClubProfileInputDTOSchema,
  GetClubProfileOutputDTOSchema,
  GetClubLogoUploadUrlInputDTOSchema,
  GetClubLogoUploadUrlOutputDTOSchema,
  GetClubImagesUploadUrlInputDTOSchema,
  GetClubImagesUploadUrlOutputDTOSchema,
  SaveClubProfileRegistrationInputDTOSchema,
  SaveClubProfileRegistrationOutputDTOSchema,
  SubmitClubProfileRegistrationInputDTOSchema,
  SubmitClubProfileRegistrationOutputDTOSchema,
} from "@/server/api/modules/clubs/dto";

export const clubsRouter = createTRPCRouter({
  getById: publicProcedure
    .input(GetClubByIdInputDTOSchema)
    .output(GetClubByIdOutputDTOSchema)
    .query(async ({ input }) => getClubById(input)),

  saveClubProfileRegistration: protectedProcedure
    .input(SaveClubProfileRegistrationInputDTOSchema)
    .output(SaveClubProfileRegistrationOutputDTOSchema)
    .mutation(async ({ ctx, input }) => saveProfileRegistration(ctx.session.user.id, input)),

  submitClubProfileRegistration: protectedProcedure
    .input(SubmitClubProfileRegistrationInputDTOSchema)
    .output(SubmitClubProfileRegistrationOutputDTOSchema)
    .mutation(async ({ ctx, input }) => submitClubProfileRegistration(ctx.session.user.id, input)),

  getClubProfile: protectedProcedure
    .input(GetClubProfileInputDTOSchema)
    .output(GetClubProfileOutputDTOSchema)
    .query(async ({ ctx }) => getClubProfile(ctx.session.user.id)),

  getLogoUploadUrl: protectedProcedure
    .input(GetClubLogoUploadUrlInputDTOSchema)
    .output(GetClubLogoUploadUrlOutputDTOSchema)
    .mutation(async ({ input, ctx }) => getClubLogoUploadUrl(ctx.session.user.id, input)),

  getImagesUploadUrl: protectedProcedure
    .input(GetClubImagesUploadUrlInputDTOSchema)
    .output(GetClubImagesUploadUrlOutputDTOSchema)
    .mutation(async ({ input, ctx }) => getClubImagesUploadUrl(ctx.session.user.id, input)),
});
