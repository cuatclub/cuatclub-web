import { z } from "zod";

export const ActivityTypeOutputDTOSchema = z.object({
  id: z.number(),
  label: z.string(),
});

export type ActivityTypeOutputDTO = z.infer<typeof ActivityTypeOutputDTOSchema>;
