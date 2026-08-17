import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { generateInvitationCode } from "@/server/api/modules/invitations/usecases";
import {
  GenerateInvitationCodeInputDTOSchema,
  GenerateInvitationCodeOutputDTOSchema,
} from "@/server/api/modules/invitations/dto";

export const invitationsRouter = createTRPCRouter({
  generate: adminProcedure
    .input(GenerateInvitationCodeInputDTOSchema)
    .output(GenerateInvitationCodeOutputDTOSchema)
    .mutation(async ({ input }) => generateInvitationCode(input)),
});
