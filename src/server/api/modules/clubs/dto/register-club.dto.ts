import { z, type ZodSchema } from "zod";

export type RegisterClubRequest = {
	email: string;
	inviteCode: string;
	password: string;
};

export const RegisterClubRequestSchema: ZodSchema<RegisterClubRequest> = z.object({
	email: z.string().email(),
	inviteCode: z.string().min(1),
	password: z.string().min(8),
});

export type RegisterClubResult = { clubId: string };
