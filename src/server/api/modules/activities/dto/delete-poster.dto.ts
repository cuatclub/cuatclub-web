import { z } from "zod";

export const DeleteActivityPosterInputDTOSchema = z.object({
  key: z.string().min(1),
});

export type DeleteActivityPosterInputDTO = z.infer<typeof DeleteActivityPosterInputDTOSchema>;

export const DeleteActivityPosterOutputDTOSchema = z.object({
  success: z.boolean(),
});

export type DeleteActivityPosterOutputDTO = z.infer<typeof DeleteActivityPosterOutputDTOSchema>;
