import { z } from "zod";

export const DeleteClubCategoryInputDTOSchema = z.object({
  clubId: z.string().uuid(),
  categoryId: z.number().int().min(1),
});

export type DeleteClubCategoryInputDTO = z.infer<typeof DeleteClubCategoryInputDTOSchema>;

export const DeleteClubCategoryOutputDTOSchema = z.object({
  clubId: z.string().uuid(),
  categoryId: z.number().int().min(1),
});

export type DeleteClubCategoryOutputDTO = z.infer<typeof DeleteClubCategoryOutputDTOSchema>;
