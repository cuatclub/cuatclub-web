import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import {
  generateInvitationCode,
  generateInvitationCodeBulk,
} from "@/server/api/modules/invitations/usecases";
import {
  GenerateInvitationCodeInputDTOSchema,
  GenerateInvitationCodeOutputDTOSchema,
  GenerateInvitationCodeBulkInputDTOSchema,
  GenerateInvitationCodeBulkOutputDTOSchema,
} from "@/server/api/modules/invitations/dto";

export const invitationsRouter = createTRPCRouter({
  generate: adminProcedure
    .input(GenerateInvitationCodeInputDTOSchema)
    .output(GenerateInvitationCodeOutputDTOSchema)
    .mutation(async ({ input }) => generateInvitationCode(input)),

  generateBulk: adminProcedure
    .input(GenerateInvitationCodeBulkInputDTOSchema)
    .output(GenerateInvitationCodeBulkOutputDTOSchema)
    .mutation(async ({ input }) => generateInvitationCodeBulk(input)),
});
