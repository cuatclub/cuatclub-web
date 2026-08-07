import { z, type ZodSchema } from "zod";

export type DeleteClubInputDTO = { id: string };

export const DeleteClubInputDTOSchema: ZodSchema<DeleteClubInputDTO> = z.object({
	id: z.string().uuid(),
});

export const DeleteClubOutputDTOSchema = z.object({
	id: z.string(),
});

export type DeleteClubOutputDTO = z.infer<typeof DeleteClubOutputDTOSchema>;
