import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  getCategoryByClubId,
  getClubProfile,
  updateClub,
} from "@/server/api/modules/clubs/usecases";
import {
  GetCategoryByClubIdInputDTOSchema,
  GetCategoryByClubIdOutputDTOSchema,
  GetClubProfileInputDTOSchema,
  GetClubProfileOutputDTOSchema,
  UpdateClubInputDTOSchema,
  UpdateClubOutputDTOSchema,
} from "@/server/api/modules/clubs/dto";

export const clubsRouter = createTRPCRouter({
  update: protectedProcedure
    .input(UpdateClubInputDTOSchema)
    .output(UpdateClubOutputDTOSchema)
    .mutation(async ({ input }) => updateClub(input)),

  getCategoryByClubId: protectedProcedure
    .input(GetCategoryByClubIdInputDTOSchema)
    .output(GetCategoryByClubIdOutputDTOSchema)
    .query(async ({ input }) => getCategoryByClubId(input)),

  getClubProfile: protectedProcedure
    .input(GetClubProfileInputDTOSchema)
    .output(GetClubProfileOutputDTOSchema)
    .query(async ({ ctx }) => getClubProfile(ctx.session.user.id)),
});
