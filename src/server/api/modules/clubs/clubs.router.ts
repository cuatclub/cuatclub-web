import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import {
  getClubById,
  getClubProfile,
  getClubLogoUploadUrl,
  getClubImagesUploadUrl,
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
} from "@/server/api/modules/clubs/dto";

export const clubsRouter = createTRPCRouter({
  getById: publicProcedure
    .input(GetClubByIdInputDTOSchema)
    .output(GetClubByIdOutputDTOSchema)
    .query(async ({ input }) => getClubById(input)),

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
