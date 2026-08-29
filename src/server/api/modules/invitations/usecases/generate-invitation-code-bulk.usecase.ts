import { generateInvitationCode } from "@/server/api/modules/invitations/usecases/generate-invitation-code.usecase";
import type {
  GenerateInvitationCodeBulkInputDTO,
  GenerateInvitationCodeBulkOutputDTO,
} from "@/server/api/modules/invitations/dto";

export const generateInvitationCodeBulk = async (
  input: GenerateInvitationCodeBulkInputDTO
): Promise<GenerateInvitationCodeBulkOutputDTO> => {
  const results = await Promise.all(
    input.invitations.map(async (invitation) => {
      try {
        const output = await generateInvitationCode(invitation);
        return { success: true as const, ...output };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to generate invitation code";
        return { success: false as const, email: invitation.email, message };
      }
    })
  );

  return { results };
};
