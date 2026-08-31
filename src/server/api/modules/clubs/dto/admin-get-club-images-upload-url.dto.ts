import { z } from "zod";
import {
  ContentTypeSchema,
  PresignedUploadUrlSchema,
} from "@/server/api/modules/clubs/dto/upload-file-meta.dto";
import { MAX_CLUB_IMAGES } from "@/server/api/modules/clubs/dto/get-club-images-upload-url.dto";

export const AdminGetClubImagesUploadUrlInputDTOSchema = z.object({
  clubId: z.string().uuid(),
  files: z
    .array(z.object({ contentType: ContentTypeSchema }))
    .min(1, "You must select at least one image to upload")
    .max(MAX_CLUB_IMAGES, `You can upload at most ${MAX_CLUB_IMAGES} images`),
});

export type AdminGetClubImagesUploadUrlInputDTO = z.infer<
  typeof AdminGetClubImagesUploadUrlInputDTOSchema
>;

export const AdminGetClubImagesUploadUrlOutputDTOSchema = z.object({
  presignedUrls: z.array(PresignedUploadUrlSchema).min(1).max(MAX_CLUB_IMAGES),
});

export type AdminGetClubImagesUploadUrlOutputDTO = z.infer<
  typeof AdminGetClubImagesUploadUrlOutputDTOSchema
>;
