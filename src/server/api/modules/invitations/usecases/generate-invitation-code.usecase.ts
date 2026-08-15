import { TRPCError } from "@trpc/server";
import { unitOfWork } from "@/server/db/unit-of-work";
import { invitationCodesRepository } from "@/server/api/modules/invitations/invitation-codes.repository";
import type {
  GenerateInvitationCodeInputDTO,
  GenerateInvitationCodeOutputDTO,
} from "@/server/api/modules/invitations/dto";
import {
  sendClubInviteCodeEmail,
  MailValidationError,
  MailDeliveryError,
} from "@/server/services/mailer";

// Client-ratified TTL — see the contract comment at the top of src/server/services/mailer.ts.
const INVITE_CODE_TTL_DAYS = 14;

export const generateInvitationCode = async (
  input: GenerateInvitationCodeInputDTO
): Promise<GenerateInvitationCodeOutputDTO> => {
  const expiredAt = new Date(Date.now() + INVITE_CODE_TTL_DAYS * 24 * 60 * 60 * 1000);

  // Invalidating the previous active code and inserting the new one happen atomically: a crash
  // between the two must never leave an email with two simultaneously active codes.
  const invitationCode = await unitOfWork.run(async (client) => {
    await invitationCodesRepository.invalidateActiveByEmail(input.email, client);
    return invitationCodesRepository.create({ email: input.email, expiredAt }, client);
  });

  try {
    await sendClubInviteCodeEmail({
      to: invitationCode.email,
      inviteCode: invitationCode.inviteCode,
      clubName: input.clubName,
    });
  } catch (err) {
    // The DB row is already committed and stays that way — deleting it here would silently
    // discard a real invalidation of whatever code preceded it. A retried `generate` call is
    // safe: it invalidates this row too and mints a fresh code, so the admin can just retry.
    if (err instanceof MailValidationError) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "The recipient email was rejected by the mail provider. Please retry.",
        cause: err,
      });
    }
    if (err instanceof MailDeliveryError) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "The code was generated, but the email could not be sent. Please retry.",
        cause: err,
      });
    }
    throw err;
  }

  return invitationCode.toDTO();
};
