import { createTRPCRouter, adminProcedure, publicProcedure } from "@/server/api/trpc";
import {
  generateInvitationCode,
  validateInvitationCode,
} from "@/server/api/modules/invitations/usecases";
import {
  GenerateInvitationCodeInputDTOSchema,
  GenerateInvitationCodeOutputDTOSchema,
  ValidateInvitationCodeInputDTOSchema,
  ValidateInvitationCodeOutputDTOSchema,
} from "@/server/api/modules/invitations/dto";

export const invitationsRouter = createTRPCRouter({
  generate: adminProcedure
    .input(GenerateInvitationCodeInputDTOSchema)
    .output(GenerateInvitationCodeOutputDTOSchema)
    .mutation(async ({ input }) => generateInvitationCode(input)),

  validate: publicProcedure
    .input(ValidateInvitationCodeInputDTOSchema)
    .output(ValidateInvitationCodeOutputDTOSchema)
    .mutation(async ({ input }) => validateInvitationCode(input)),
});
