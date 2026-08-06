import { z, type ZodSchema } from "zod";

export type DeleteClubRequest = { id: string };

export const DeleteClubRequestSchema: ZodSchema<DeleteClubRequest> = z.object({
	id: z.string().uuid(),
});
