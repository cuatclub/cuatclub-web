import { z } from "zod";
import {
  ContentTypeSchema,
  PresignedUploadUrlSchema,
} from "@/server/api/modules/clubs/dto/upload-file-meta.dto";

export const MAX_CLUB_IMAGES = 5;

export const GetClubImagesUploadUrlInputDTOSchema = z.object({
  files: z
    .array(z.object({ contentType: ContentTypeSchema }))
    .min(1, "You must select at least one image to upload")
    .max(MAX_CLUB_IMAGES, `You can upload at most ${MAX_CLUB_IMAGES} images`),
});

export type GetClubImagesUploadUrlInputDTO = z.infer<typeof GetClubImagesUploadUrlInputDTOSchema>;

export const GetClubImagesUploadUrlOutputDTOSchema = z.object({
  presignedUrls: z.array(PresignedUploadUrlSchema).min(1).max(MAX_CLUB_IMAGES),
});

export type GetClubImagesUploadUrlOutputDTO = z.infer<typeof GetClubImagesUploadUrlOutputDTOSchema>;
