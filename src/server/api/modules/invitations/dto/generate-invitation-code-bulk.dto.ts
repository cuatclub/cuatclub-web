import { z } from "zod";
import {
  GenerateInvitationCodeInputDTOSchema,
  GenerateInvitationCodeOutputDTOSchema,
} from "@/server/api/modules/invitations/dto/generate-invitation-code.dto";

export const GenerateInvitationCodeBulkInputDTOSchema = z.object({
  invitations: z.array(GenerateInvitationCodeInputDTOSchema).min(1).max(50),
});

export type GenerateInvitationCodeBulkInputDTO = z.infer<
  typeof GenerateInvitationCodeBulkInputDTOSchema
>;

// Each row is processed independently (see generate-invitation-code-bulk.usecase.ts), so one
// bad email must not fail the whole batch — the result discriminates success per row instead of
// throwing on the first failure.
export const GenerateInvitationCodeBulkResultDTOSchema = z.discriminatedUnion("success", [
  GenerateInvitationCodeOutputDTOSchema.extend({ success: z.literal(true) }),
  z.object({ success: z.literal(false), email: z.string(), message: z.string() }),
]);

export type GenerateInvitationCodeBulkResultDTO = z.infer<
  typeof GenerateInvitationCodeBulkResultDTOSchema
>;

export const GenerateInvitationCodeBulkOutputDTOSchema = z.object({
  results: z.array(GenerateInvitationCodeBulkResultDTOSchema),
});

export type GenerateInvitationCodeBulkOutputDTO = z.infer<
  typeof GenerateInvitationCodeBulkOutputDTOSchema
>;
