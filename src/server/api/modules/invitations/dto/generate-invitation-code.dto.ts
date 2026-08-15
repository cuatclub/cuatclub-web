import { z } from "zod";

export const GenerateInvitationCodeInputDTOSchema = z.object({
  email: z.string().min(1).max(254).email(),
  clubName: z.string().min(1).max(120).optional(),
});

export type GenerateInvitationCodeInputDTO = z.infer<typeof GenerateInvitationCodeInputDTOSchema>;

// Never includes the raw invite code — the email is the only delivery channel for it.
export const GenerateInvitationCodeOutputDTOSchema = z.object({
  email: z.string(),
  expiredAt: z.date(),
  createdAt: z.date(),
});

export type GenerateInvitationCodeOutputDTO = z.infer<typeof GenerateInvitationCodeOutputDTOSchema>;
