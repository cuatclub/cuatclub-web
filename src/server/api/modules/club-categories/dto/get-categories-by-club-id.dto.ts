import { z } from "zod";

export const GetCategoriesByClubIdInputDTOSchema = z.object({
  clubId: z.string().uuid(),
});

export type GetCategoriesByClubIdInputDTO = z.infer<typeof GetCategoriesByClubIdInputDTOSchema>;

export const GetCategoriesByClubIdOutputDTOSchema = z.array(
  z.object({
    id: z.number(),
    label: z.string(),
    fontColor: z.string(),
    backgroundColor: z.string(),
  })
);

export type GetCategoriesByClubIdOutputDTO = z.infer<typeof GetCategoriesByClubIdOutputDTOSchema>;
