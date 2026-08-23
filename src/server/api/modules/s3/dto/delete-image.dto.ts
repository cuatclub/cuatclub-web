import { z } from "zod";

export const DeleteImagesInputDTOSchema = z.object({
  urls: z.array(z.string().min(1, "URL is required")).min(1, "At least one URL is required"),
});

export type DeleteImagesInputDTO = z.infer<typeof DeleteImagesInputDTOSchema>;

export const DeleteImagesOutputDTOSchema = z.object({
  success: z.boolean(),
  deleted: z.array(z.string()).default([]),
  errors: z.array(z.string()).default([]),
});

export type DeleteImagesOutputDTO = z.infer<typeof DeleteImagesOutputDTOSchema>;
