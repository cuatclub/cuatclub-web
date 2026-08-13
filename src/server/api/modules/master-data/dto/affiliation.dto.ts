import { z } from "zod";

export const AffiliationOutputDTOSchema = z.object({
  id: z.number(),
  label: z.string(),
});

export type AffiliationOutputDTO = z.infer<typeof AffiliationOutputDTOSchema>;
