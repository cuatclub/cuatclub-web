import { z, type ZodSchema } from "zod";
import type { invitationCodes } from "@/server/db/invitation-codes";

export type InvitationCode = typeof invitationCodes.$inferSelect;

export type IssueInvitationCodeRequest = {
	email: string;
	expiresInDays?: number;
};

export const IssueInvitationCodeRequestSchema: ZodSchema<IssueInvitationCodeRequest> = z.object({
	email: z.string().email(),
	expiresInDays: z.number().int().positive().optional(),
});
