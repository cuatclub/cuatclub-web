import { z } from "zod";
import {
  ContentTypeSchema,
  PresignedUploadUrlSchema,
} from "@/server/api/modules/clubs/dto/upload-file-meta.dto";

export const GetClubLogoUploadUrlInputDTOSchema = z.object({
  contentType: ContentTypeSchema,
});

export type GetClubLogoUploadUrlInputDTO = z.infer<typeof GetClubLogoUploadUrlInputDTOSchema>;

export const GetClubLogoUploadUrlOutputDTOSchema = PresignedUploadUrlSchema;

export type GetClubLogoUploadUrlOutputDTO = z.infer<typeof GetClubLogoUploadUrlOutputDTOSchema>;
