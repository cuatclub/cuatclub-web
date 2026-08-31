import { z } from "zod";

export const DeleteCategoryInputDTOSchema = z.object({ id: z.number().int().positive() });
export type DeleteCategoryInputDTO = z.infer<typeof DeleteCategoryInputDTOSchema>;

export const DeleteCategoryOutputDTOSchema = z.object({ success: z.literal(true) });
export type DeleteCategoryOutputDTO = z.infer<typeof DeleteCategoryOutputDTOSchema>;
