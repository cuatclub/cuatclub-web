import { z } from "zod";
import {
  ContentTypeSchema,
  PresignedUploadUrlSchema,
} from "@/server/api/modules/clubs/dto/upload-file-meta.dto";

export const AdminGetClubLogoUploadUrlInputDTOSchema = z.object({
  clubId: z.string().uuid(),
  contentType: ContentTypeSchema,
});

export type AdminGetClubLogoUploadUrlInputDTO = z.infer<
  typeof AdminGetClubLogoUploadUrlInputDTOSchema
>;

export const AdminGetClubLogoUploadUrlOutputDTOSchema = PresignedUploadUrlSchema;

export type AdminGetClubLogoUploadUrlOutputDTO = z.infer<
  typeof AdminGetClubLogoUploadUrlOutputDTOSchema
>;
