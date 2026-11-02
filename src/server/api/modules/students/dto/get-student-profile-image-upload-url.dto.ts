import { z } from "zod";
import {
  ContentTypeSchema,
  PresignedUploadUrlSchema,
} from "@/server/api/modules/students/dto/upload-file-meta.dto";

export const MAX_PROFILE_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;

export const GetStudentProfileImageUploadUrlInputDTOSchema = z.object({
  contentType: ContentTypeSchema,
  contentLength: z
    .number()
    .int()
    .positive()
    .max(MAX_PROFILE_IMAGE_UPLOAD_BYTES, "Profile image must be 5 MB or smaller."),
});

export type GetStudentProfileImageUploadUrlInputDTO = z.infer<
  typeof GetStudentProfileImageUploadUrlInputDTOSchema
>;

export const GetStudentProfileImageUploadUrlOutputDTOSchema = PresignedUploadUrlSchema;

export type GetStudentProfileImageUploadUrlOutputDTO = z.infer<
  typeof GetStudentProfileImageUploadUrlOutputDTOSchema
>;
