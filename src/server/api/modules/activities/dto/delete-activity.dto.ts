import { z } from "zod";

export const DeleteActivityInputDTOSchema = z.object({
  id: z.string().uuid(),
});

export type DeleteActivityInputDTO = z.infer<typeof DeleteActivityInputDTOSchema>;

export const DeleteActivityOutputDTOSchema = z.object({
  success: z.boolean(),
});

export type DeleteActivityOutputDTO = z.infer<typeof DeleteActivityOutputDTOSchema>;
