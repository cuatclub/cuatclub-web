import { z } from "zod";
import {
  ContentTypeSchema,
  PresignedUploadUrlSchema,
} from "@/server/api/modules/activities/dto/upload-file-meta.dto";

export const GetActivityPosterUploadUrlInputDTOSchema = z.object({
  contentType: ContentTypeSchema,
});

export type GetActivityPosterUploadUrlInputDTO = z.infer<
  typeof GetActivityPosterUploadUrlInputDTOSchema
>;

export const GetActivityPosterUploadUrlOutputDTOSchema = PresignedUploadUrlSchema;

export type GetActivityPosterUploadUrlOutputDTO = z.infer<
  typeof GetActivityPosterUploadUrlOutputDTOSchema
>;
