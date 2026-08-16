import { z } from "zod";

export const CreateClubCategoryInputDTOSchema = z.object({
  clubId: z.string().uuid(),
  categoryId: z.number().int().min(1),
});

export type CreateClubCategoryInputDTO = z.infer<typeof CreateClubCategoryInputDTOSchema>;

export const CreateClubCategoryOutputDTOSchema = z.object({
  clubId: z.string().uuid(),
  categoryId: z.number().int().min(1),
});

export type CreateClubCategoryOutputDTO = z.infer<typeof CreateClubCategoryOutputDTOSchema>;
