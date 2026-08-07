import { z } from "zod";

export type GetAllFacultiesInputDTO = Record<string, never>;

export const GetAllFacultiesInputDTOSchema = z.object({});

export const GetAllFacultiesOutputDTOSchema = z.array(
  z.object({
    id: z.number(),
    label: z.string(),
  })
);

export type GetAllFacultiesOutputDTO = z.infer<typeof GetAllFacultiesOutputDTOSchema>;
