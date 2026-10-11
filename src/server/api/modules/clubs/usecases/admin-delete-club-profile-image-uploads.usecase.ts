import {
  AdminDeleteClubProfileImageUploadsOutputDTOSchema,
  type AdminDeleteClubProfileImageUploadsInputDTO,
  type AdminDeleteClubProfileImageUploadsOutputDTO,
} from "@/server/api/modules/clubs/dto";
import { clubsRepository } from "@/server/api/modules/clubs/repositories/clubs.repository";
import { notFound, validationError } from "@/server/errors";
import { deleteImages, isKeyDirectlyWithinPrefix, toR2Key } from "@/server/services/r2";

export const adminDeleteClubProfileImageUploads = async (
  input: AdminDeleteClubProfileImageUploadsInputDTO
): Promise<AdminDeleteClubProfileImageUploadsOutputDTO> => {
  const detail = await clubsRepository.getDetailById(input.clubId);
  if (!detail) throw notFound("Club not found");

  const allowedPrefix = `clubs/${detail.id}/`;
  if (input.keys.some((key) => !isKeyDirectlyWithinPrefix(key, allowedPrefix))) {
    throw validationError("An upload key does not belong to this club.");
  }

  const attachedKeys = new Set(
    [detail.logoUrl, ...detail.imageUrls].filter((url): url is string => url !== null).map(toR2Key)
  );
  if (input.keys.some((key) => attachedKeys.has(key))) {
    throw validationError("An uploaded image is attached to the club and cannot be deleted.");
  }

  const result = await deleteImages(input.keys);

  return AdminDeleteClubProfileImageUploadsOutputDTOSchema.parse({
    success: result.errors.length === 0,
  });
};
