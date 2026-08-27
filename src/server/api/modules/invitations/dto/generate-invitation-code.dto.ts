import { z } from "zod";

export const GenerateInvitationCodeInputDTOSchema = z.object({
  // Lowercased to match how registration looks this row up (see register-club.dto.ts).
  email: z.string().min(1).max(254).email().toLowerCase(),
  clubName: z.string().min(1).max(120).optional(),
});

export type GenerateInvitationCodeInputDTO = z.infer<typeof GenerateInvitationCodeInputDTOSchema>;

export const GenerateInvitationCodeOutputDTOSchema = z.object({
  email: z.string(),
  inviteCode: z.string(),
  expiredAt: z.date(),
  createdAt: z.date(),
});

export type GenerateInvitationCodeOutputDTO = z.infer<typeof GenerateInvitationCodeOutputDTOSchema>;
