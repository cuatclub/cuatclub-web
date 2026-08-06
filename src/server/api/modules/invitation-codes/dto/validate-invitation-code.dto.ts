import { z, type ZodSchema } from "zod";

export type ValidateInvitationCodeRequest = {
	email: string;
	code: string;
};

export const ValidateInvitationCodeRequestSchema: ZodSchema<ValidateInvitationCodeRequest> = z.object({
	email: z.string().email(),
	code: z.string().min(1),
});

export type ValidateInvitationCodeResult = {
	valid: boolean;
	reason?: "not_found" | "expired" | "used";
};
