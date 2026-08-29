import { generateInvitationCode } from "@/server/api/modules/invitations/usecases/generate-invitation-code.usecase";
import type {
  GenerateInvitationCodeBulkInputDTO,
  GenerateInvitationCodeBulkOutputDTO,
  GenerateInvitationCodeBulkResultDTO,
} from "@/server/api/modules/invitations/dto";

export const generateInvitationCodeBulk = async (
  input: GenerateInvitationCodeBulkInputDTO
): Promise<GenerateInvitationCodeBulkOutputDTO> => {
  // Two entries for the same email would each run an independent read/revoke/create
  // transaction concurrently, racing to be "the" active code — only the first is processed,
  // later duplicates are reported back as failed rather than silently minting extra codes.
  const seenEmails = new Set<string>();

  const results = await Promise.all(
    input.invitations.map(async (invitation): Promise<GenerateInvitationCodeBulkResultDTO> => {
      if (seenEmails.has(invitation.email)) {
        return {
          success: false,
          email: invitation.email,
          message: "Duplicate email in this batch",
        };
      }
      seenEmails.add(invitation.email);

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
