import { z } from "zod";

import { ClubProfileUploadKeysSchema } from "@/server/api/modules/clubs/dto/delete-club-profile-image-uploads.dto";

export const AdminDeleteClubProfileImageUploadsInputDTOSchema = z.object({
  clubId: z.string().uuid(),
  keys: ClubProfileUploadKeysSchema,
});

export type AdminDeleteClubProfileImageUploadsInputDTO = z.infer<
  typeof AdminDeleteClubProfileImageUploadsInputDTOSchema
>;

export const AdminDeleteClubProfileImageUploadsOutputDTOSchema = z.object({
  success: z.boolean(),
});

export type AdminDeleteClubProfileImageUploadsOutputDTO = z.infer<
  typeof AdminDeleteClubProfileImageUploadsOutputDTOSchema
>;
