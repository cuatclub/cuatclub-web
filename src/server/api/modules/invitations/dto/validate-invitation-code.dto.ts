import { z } from "zod";

export const ValidateInvitationCodeInputDTOSchema = z.object({
  email: z.string().min(1).max(254).email(),
  inviteCode: z.string().min(1).max(64),
});

export type ValidateInvitationCodeInputDTO = z.infer<typeof ValidateInvitationCodeInputDTOSchema>;

export const ValidateInvitationCodeOutputDTOSchema = z.object({
  valid: z.boolean(),
  email: z.string().optional(),
  reason: z.enum(["not_found", "expired", "used"]).optional(),
});

export type ValidateInvitationCodeOutputDTO = z.infer<typeof ValidateInvitationCodeOutputDTOSchema>;
