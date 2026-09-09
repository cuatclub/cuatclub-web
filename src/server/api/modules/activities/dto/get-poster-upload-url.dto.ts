import { z } from "zod";
import {
  ContentTypeSchema,
  PresignedUploadUrlSchema,
} from "@/server/api/modules/activities/dto/upload-file-meta.dto";

export const MAX_POSTER_UPLOAD_BYTES = 10 * 1024 * 1024;

export const GetActivityPosterUploadUrlInputDTOSchema = z.object({
  contentType: ContentTypeSchema,
  contentLength: z
    .number()
    .int()
    .positive()
    .max(MAX_POSTER_UPLOAD_BYTES, "Poster image must be 10 MB or smaller."),
});

export type GetActivityPosterUploadUrlInputDTO = z.infer<
  typeof GetActivityPosterUploadUrlInputDTOSchema
>;

export const GetActivityPosterUploadUrlOutputDTOSchema = PresignedUploadUrlSchema;

export type GetActivityPosterUploadUrlOutputDTO = z.infer<
  typeof GetActivityPosterUploadUrlOutputDTOSchema
>;
