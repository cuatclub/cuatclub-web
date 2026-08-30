import { z } from "zod";

export const AffiliationOutputDTOSchema = z.object({
  id: z.number(),
  label: z.string(),
});

export type AffiliationOutputDTO = z.infer<typeof AffiliationOutputDTOSchema>;

export const AffiliationBaseInputDTOSchema = z.object({
  label: z.string().trim().min(1).max(100),
});
