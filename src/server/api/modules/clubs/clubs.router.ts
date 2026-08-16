import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  createClub,
  deleteClub,
  getClubProfile,
  updateClub,
} from "@/server/api/modules/clubs/usecases";
import {
  CreateClubInputDTOSchema,
  CreateClubOutputDTOSchema,
  DeleteClubInputDTOSchema,
  DeleteClubOutputDTOSchema,
  GetClubProfileInputDTOSchema,
  GetClubProfileOutputDTOSchema,
  UpdateClubInputDTOSchema,
  UpdateClubOutputDTOSchema,
} from "@/server/api/modules/clubs/dto";

export const clubsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateClubInputDTOSchema)
    .output(CreateClubOutputDTOSchema)
    .mutation(async ({ input }) => createClub(input)),

  update: protectedProcedure
    .input(UpdateClubInputDTOSchema)
    .output(UpdateClubOutputDTOSchema)
    .mutation(async ({ input }) => updateClub(input)),

  delete: protectedProcedure
    .input(DeleteClubInputDTOSchema)
    .output(DeleteClubOutputDTOSchema)
    .mutation(async ({ input }) => deleteClub(input)),

  getClubProfile: protectedProcedure
    .input(GetClubProfileInputDTOSchema)
    .output(GetClubProfileOutputDTOSchema)
    .query(async ({ ctx }) => getClubProfile(ctx.session.user.id)),
});
