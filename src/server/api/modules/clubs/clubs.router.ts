import {
  createTRPCRouter,
  adminProcedure,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  getAllClubs,
  getAllClubsForAdmin,
  getClubById,
  getClubProfile,
  getClubRegistrationDetails,
  getClubLogoUploadUrl,
  getClubImagesUploadUrl,
  saveProfileRegistration,
  submitClubProfileRegistration,
  reopenClubProfileRegistration,
  registerClub,
} from "@/server/api/modules/clubs/usecases";
import {
  GetAllClubsInputDTOSchema,
  GetAllClubsOutputDTOSchema,
  GetAllClubsAdminInputDTOSchema,
  GetAllClubsAdminOutputDTOSchema,
  GetClubByIdInputDTOSchema,
  GetClubByIdOutputDTOSchema,
  GetClubProfileInputDTOSchema,
  GetClubProfileOutputDTOSchema,
  GetClubRegistrationDetailsInputDTOSchema,
  GetClubRegistrationDetailsOutputDTOSchema,
  GetClubLogoUploadUrlInputDTOSchema,
  GetClubLogoUploadUrlOutputDTOSchema,
  GetClubImagesUploadUrlInputDTOSchema,
  GetClubImagesUploadUrlOutputDTOSchema,
  SaveClubProfileRegistrationInputDTOSchema,
  SaveClubProfileRegistrationOutputDTOSchema,
  SubmitClubProfileRegistrationInputDTOSchema,
  SubmitClubProfileRegistrationOutputDTOSchema,
  ReopenClubProfileRegistrationInputDTOSchema,
  ReopenClubProfileRegistrationOutputDTOSchema,
  RegisterClubInputDTOSchema,
  RegisterClubOutputDTOSchema,
} from "@/server/api/modules/clubs/dto";

export const clubsRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(GetAllClubsInputDTOSchema)
    .output(GetAllClubsOutputDTOSchema)
    .query(async ({ input }) => getAllClubs(input)),

  getAllForAdmin: adminProcedure
    .input(GetAllClubsAdminInputDTOSchema)
    .output(GetAllClubsAdminOutputDTOSchema)
    .query(async ({ input }) => getAllClubsForAdmin(input)),

  getById: publicProcedure
    .input(GetClubByIdInputDTOSchema)
    .output(GetClubByIdOutputDTOSchema)
    .query(async ({ input }) => getClubById(input)),

  register: publicProcedure
    .input(RegisterClubInputDTOSchema)
    .output(RegisterClubOutputDTOSchema)
    .mutation(async ({ input }) => registerClub(input)),

  saveClubProfileRegistration: protectedProcedure
    .input(SaveClubProfileRegistrationInputDTOSchema)
    .output(SaveClubProfileRegistrationOutputDTOSchema)
    .mutation(async ({ ctx, input }) => saveProfileRegistration(ctx.session.user.id, input)),

  submitClubProfileRegistration: protectedProcedure
    .input(SubmitClubProfileRegistrationInputDTOSchema)
    .output(SubmitClubProfileRegistrationOutputDTOSchema)
    .mutation(async ({ ctx, input }) => submitClubProfileRegistration(ctx.session.user.id, input)),

  reopenClubProfileRegistration: protectedProcedure
    .input(ReopenClubProfileRegistrationInputDTOSchema)
    .output(ReopenClubProfileRegistrationOutputDTOSchema)
    .mutation(async ({ ctx }) => reopenClubProfileRegistration(ctx.session.user.id)),

  getClubProfile: protectedProcedure
    .input(GetClubProfileInputDTOSchema)
    .output(GetClubProfileOutputDTOSchema)
    .query(async ({ ctx }) => getClubProfile(ctx.session.user.id)),

  getClubRegistrationDetails: protectedProcedure
    .input(GetClubRegistrationDetailsInputDTOSchema)
    .output(GetClubRegistrationDetailsOutputDTOSchema)
    .query(async ({ ctx }) => getClubRegistrationDetails(ctx.session.user.id)),

  getLogoUploadUrl: protectedProcedure
    .input(GetClubLogoUploadUrlInputDTOSchema)
    .output(GetClubLogoUploadUrlOutputDTOSchema)
    .mutation(async ({ input, ctx }) => getClubLogoUploadUrl(ctx.session.user.id, input)),

  getImagesUploadUrl: protectedProcedure
    .input(GetClubImagesUploadUrlInputDTOSchema)
    .output(GetClubImagesUploadUrlOutputDTOSchema)
    .mutation(async ({ input, ctx }) => getClubImagesUploadUrl(ctx.session.user.id, input)),
});
