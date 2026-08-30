import type { z } from "zod";
import {
  AffiliationBaseInputDTOSchema,
  AffiliationOutputDTOSchema,
} from "@/server/api/modules/master-data/dto/affiliation.dto";

export const CreateAffiliationInputDTOSchema = AffiliationBaseInputDTOSchema;

export type CreateAffiliationInputDTO = z.infer<typeof CreateAffiliationInputDTOSchema>;

export const CreateAffiliationOutputDTOSchema = AffiliationOutputDTOSchema;

export type CreateAffiliationOutputDTO = z.infer<typeof CreateAffiliationOutputDTOSchema>;
