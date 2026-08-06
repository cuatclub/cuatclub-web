import { z, type ZodSchema } from "zod";

export type DeleteClubInputDTO = { id: string };

export const DeleteClubInputDTOSchema: ZodSchema<DeleteClubInputDTO> = z.object({
	id: z.string().uuid(),
});

export type DeleteClubOutputDTO = { id: string };

export const DeleteClubOutputDTOSchema = z.object({
	id: z.string(),
});
