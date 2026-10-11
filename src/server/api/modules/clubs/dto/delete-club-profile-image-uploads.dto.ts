import { z } from "zod";

import { MAX_CLUB_IMAGES } from "@/server/api/modules/clubs/dto/get-club-images-upload-url.dto";

export const ClubProfileUploadKeysSchema = z
  .array(z.string().trim().min(1))
  .min(1, "At least one upload key is required")
  .max(MAX_CLUB_IMAGES + 1, `At most ${MAX_CLUB_IMAGES + 1} upload keys are allowed`)
  .refine((keys) => new Set(keys).size === keys.length, {
    message: "Duplicate upload keys are not allowed",
  });

export const DeleteClubProfileImageUploadsInputDTOSchema = z.object({
  keys: ClubProfileUploadKeysSchema,
});

export type DeleteClubProfileImageUploadsInputDTO = z.infer<
  typeof DeleteClubProfileImageUploadsInputDTOSchema
>;

export const DeleteClubProfileImageUploadsOutputDTOSchema = z.object({
  success: z.boolean(),
});

export type DeleteClubProfileImageUploadsOutputDTO = z.infer<
  typeof DeleteClubProfileImageUploadsOutputDTOSchema
>;
