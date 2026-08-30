import { z } from "zod";
import {
  AffiliationBaseInputDTOSchema,
  AffiliationOutputDTOSchema,
} from "@/server/api/modules/master-data/dto/affiliation.dto";

export const UpdateAffiliationInputDTOSchema = AffiliationBaseInputDTOSchema.extend({
  id: z.number().int().positive(),
});

export type UpdateAffiliationInputDTO = z.infer<typeof UpdateAffiliationInputDTOSchema>;

export const UpdateAffiliationOutputDTOSchema = AffiliationOutputDTOSchema;

export type UpdateAffiliationOutputDTO = z.infer<typeof UpdateAffiliationOutputDTOSchema>;
