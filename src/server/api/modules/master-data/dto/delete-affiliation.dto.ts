import { z } from "zod";

export const DeleteAffiliationInputDTOSchema = z.object({ id: z.number().int().positive() });
export type DeleteAffiliationInputDTO = z.infer<typeof DeleteAffiliationInputDTOSchema>;

export const DeleteAffiliationOutputDTOSchema = z.object({ success: z.literal(true) });
export type DeleteAffiliationOutputDTO = z.infer<typeof DeleteAffiliationOutputDTOSchema>;
