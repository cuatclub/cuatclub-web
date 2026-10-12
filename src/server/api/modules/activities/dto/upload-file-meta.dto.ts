import { z } from "zod";
import { ALLOWED_TYPES } from "@/server/services/r2";

// Deliberately duplicated from clubs/dto/upload-file-meta.dto.ts — cross-module
// imports at the data-access level are disallowed, and this shape is tiny.
export const ContentTypeSchema = z
  .string()
  .refine((type) => ALLOWED_TYPES.some((allowedType) => allowedType === type), {
    message: "Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.",
  });

export const PresignedUploadUrlSchema = z.object({
  key: z.string(),
  url: z.string().url("Invalid presigned URL format"),
  publicUrl: z.string().url("Invalid public URL format"),
});
