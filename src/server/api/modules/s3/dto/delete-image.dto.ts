import { z } from "zod";

export const DeleteImagesInputDTOSchema = z.object({
  fileKeys: z
    .array(z.string().min(1, "File key is required"))
    .min(1, "At least one file key is required"),
});

export type DeleteImagesInputDTO = z.infer<typeof DeleteImagesInputDTOSchema>;

export const DeleteImagesOutputDTOSchema = z.object({
  success: z.boolean(),
  deleted: z.array(z.string()).default([]),
  errors: z.array(z.string()).default([]),
});

export type DeleteImagesOutputDTO = z.infer<typeof DeleteImagesOutputDTOSchema>;
