import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getClubProfile } from "@/server/api/modules/clubs/usecases";
import {
  GetClubProfileInputDTOSchema,
  GetClubProfileOutputDTOSchema,
} from "@/server/api/modules/clubs/dto";

export const clubsRouter = createTRPCRouter({
  getClubProfile: protectedProcedure
    .input(GetClubProfileInputDTOSchema)
    .output(GetClubProfileOutputDTOSchema)
    .query(async ({ ctx }) => getClubProfile(ctx.session.user.id)),
});
