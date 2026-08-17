import { invitationCodesRepository } from "@/server/api/modules/invitations/invitation-codes.repository";
import type {
  ValidateInvitationCodeInputDTO,
  ValidateInvitationCodeOutputDTO,
} from "@/server/api/modules/invitations/dto";

export const validateInvitationCode = async (
  input: ValidateInvitationCodeInputDTO
): Promise<ValidateInvitationCodeOutputDTO> => {
  const code = await invitationCodesRepository.findByInviteCode(input.inviteCode);

  if (!code) return { valid: false, reason: "not_found" };

  // Same reason as "no such code" — don't let the API tell an attacker whether a code
  // exists but belongs to someone else vs. not existing at all (enumeration risk).
  if (code.email.toLowerCase() !== input.email.toLowerCase()) {
    return { valid: false, reason: "not_found" };
  }

  if (code.usedAt) return { valid: false, reason: "used" };
  if (code.expiredAt <= new Date()) return { valid: false, reason: "expired" };

  return { valid: true, email: code.email };
};
