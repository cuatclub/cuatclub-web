import { z } from "zod";

export const GetCategoryByClubIdInputDTOSchema = z.object({
  clubId: z.string().uuid(),
});

export type GetCategoryByClubIdInputDTO = z.infer<typeof GetCategoryByClubIdInputDTOSchema>;

export const GetCategoryByClubIdOutputDTOSchema = z.array(
  z.object({
    id: z.number(),
    label: z.string(),
    fontColor: z.string(),
    backgroundColor: z.string(),
  })
);

export type GetCategoryByClubIdOutputDTO = z.infer<typeof GetCategoryByClubIdOutputDTOSchema>;
