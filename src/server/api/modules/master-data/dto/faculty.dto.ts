import { z } from "zod";

export const FacultyOutputDTOSchema = z.object({
  id: z.number(),
  label: z.string(),
});

export type FacultyOutputDTO = z.infer<typeof FacultyOutputDTOSchema>;
