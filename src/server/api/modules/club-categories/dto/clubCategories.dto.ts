import { z } from "zod";

export const ClubCategoriesOutputDTOSchema = z.object({
  clubId: z.string(),
  categoryId: z.number(),
});

export type ClubCategoriesOutputDTO = z.infer<typeof ClubCategoriesOutputDTOSchema>;
