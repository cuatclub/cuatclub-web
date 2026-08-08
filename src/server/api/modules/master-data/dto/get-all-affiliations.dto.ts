import { z } from "zod";

export type GetAllAffiliationsInputDTO = Record<string, never>;

export const GetAllAffiliationsInputDTOSchema = z.object({});

export const GetAllAffiliationsOutputDTOSchema = z.array(
  z.object({
    id: z.number(),
    label: z.string(),
  })
);

export type GetAllAffiliationsOutputDTO = z.infer<typeof GetAllAffiliationsOutputDTOSchema>;
