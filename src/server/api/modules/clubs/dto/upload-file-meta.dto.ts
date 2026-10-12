import { z } from "zod";
import { ALLOWED_TYPES } from "@/server/services/r2";

export const MAX_PROFILE_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;

export const ContentTypeSchema = z
  .string()
  .refine((type) => ALLOWED_TYPES.some((allowedType) => allowedType === type), {
    message: "Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.",
  });

export const ContentLengthSchema = z
  .number()
  .int()
  .positive()
  .max(MAX_PROFILE_IMAGE_UPLOAD_BYTES, "Image must be 10 MiB or smaller");

export const PresignedUploadUrlSchema = z.object({
  key: z.string(),
  url: z.string().url("Invalid presigned URL format"),
  publicUrl: z.string().url("Invalid public URL format"),
});
