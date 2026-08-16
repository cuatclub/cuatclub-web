import { z } from "zod";

export const CategoryOutputDTOSchema = z.object({
  id: z.number(),
  label: z.string(),
  fontColor: z.string(),
  backgroundColor: z.string(),
});

export type CategoryOutputDTO = z.infer<typeof CategoryOutputDTOSchema>;
