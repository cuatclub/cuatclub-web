import { z, type ZodSchema } from "zod";

export type ListInvitationCodesRequest = {
	email?: string;
};

export const ListInvitationCodesRequestSchema: ZodSchema<ListInvitationCodesRequest> = z.object({
	email: z.string().email().optional(),
});
