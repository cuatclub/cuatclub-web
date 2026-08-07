import { z } from "zod";

export type GetAllCategoriesInputDTO = Record<string, never>;

export const GetAllCategoriesInputDTOSchema = z.object({});

export const GetAllCategoriesOutputDTOSchema = z.array(
  z.object({
    id: z.number(),
    label: z.string(),
    fontColor: z.string(),
    backgroundColor: z.string(),
  })
);

export type GetAllCategoriesOutputDTO = z.infer<typeof GetAllCategoriesOutputDTOSchema>;
