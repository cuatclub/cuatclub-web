import { z } from "zod";
import { ALLOWED_TYPES } from "@/server/services/r2";

export const FileMetaSchema = z.object({
  filename: z.string().min(1, "Filename is required"),

  contentType: z
    .string()
    .refine((type) => ALLOWED_TYPES.some((allowedType) => allowedType === type), {
      message: "Invalid file type. Only JPEG, PNG, and WEBP are allowed.",
    }),

  size: z
    .number()
    .positive("File size must be greater than 0")
    .max(10 * 1024 * 1024, "File size must be less than or equal to 10MB"),
});

export const GetPresignedUrlsInputDTOSchema = z.object({
  files: z.array(FileMetaSchema).min(1, "You must select at least one file to upload"),
});

export type GetPresignedUrlsInputDTO = z.infer<typeof GetPresignedUrlsInputDTOSchema>;

export const PresignedUrlItemSchema = z.object({
  originalName: z.string(),
  fileKey: z.string(),
  url: z.string().url("Invalid presigned URL format"),
});

export const GetPresignedUrlsOutputDTOSchema = z.object({
  presignedUrls: z.array(PresignedUrlItemSchema).min(1, "No presigned URLs generated"),
});

export type GetPresignedUrlsOutputDTO = z.infer<typeof GetPresignedUrlsOutputDTOSchema>;
export type PresignedUrlItem = z.infer<typeof PresignedUrlItemSchema>;
