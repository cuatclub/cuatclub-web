import { z } from "zod";
import { ALLOWED_TYPES } from "@/server/services/r2";

export const ContentTypeSchema = z
  .string()
  .refine((type) => ALLOWED_TYPES.some((allowedType) => allowedType === type), {
    message: "Invalid file type. Only JPEG, PNG, HEIC, WEBP, and GIF are allowed.",
  });

export const PresignedUploadUrlSchema = z.object({
  key: z.string(),
  url: z.string().url("Invalid presigned URL format"),
  publicUrl: z.string().url("Invalid public URL format"),
});
