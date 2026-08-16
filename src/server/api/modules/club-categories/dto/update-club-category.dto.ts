import { z } from "zod";

export const UpdateClubCategoryInputDTOSchema = z.object({
  currentClubId: z.string().uuid(),
  currentCategoryId: z.number().int().min(1),
  nextClubId: z.string().uuid().optional(),
  nextCategoryId: z.number().int().min(1).optional(),
});

export type UpdateClubCategoryInputDTO = z.infer<typeof UpdateClubCategoryInputDTOSchema>;

export const UpdateClubCategoryOutputDTOSchema = z.object({
  clubId: z.string().uuid(),
  categoryId: z.number().int().min(1),
});

export type UpdateClubCategoryOutputDTO = z.infer<typeof UpdateClubCategoryOutputDTOSchema>;
