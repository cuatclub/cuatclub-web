import { z } from "zod";
import { AffiliationOutputDTOSchema } from "@/server/api/modules/master-data/dto/affiliation.dto";

export type GetAllAffiliationsInputDTO = Record<string, never>;

export const GetAllAffiliationsInputDTOSchema = z.object({});

export const GetAllAffiliationsOutputDTOSchema = z.array(AffiliationOutputDTOSchema);

export type GetAllAffiliationsOutputDTO = z.infer<typeof GetAllAffiliationsOutputDTOSchema>;
