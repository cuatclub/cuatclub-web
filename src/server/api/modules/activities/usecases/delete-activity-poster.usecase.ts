import {
  DeleteActivityPosterOutputDTOSchema,
  type DeleteActivityPosterInputDTO,
  type DeleteActivityPosterOutputDTO,
} from "@/server/api/modules/activities/dto";
import { activitiesRepository } from "@/server/api/modules/activities/activities.repository";
import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import { deleteImages, getPublicUrl } from "@/server/services/r2";
import { notFound, validationError } from "@/server/errors";

/**
 * Removes a poster object that was uploaded via a presigned URL but never
 * attached to an activity (e.g. the create mutation failed afterwards). The key
 * is checked against the caller's own club prefix so a club can only delete its
 * own orphaned uploads.
 */
export const deleteActivityPoster = async (
  userId: string,
  input: DeleteActivityPosterInputDTO
): Promise<DeleteActivityPosterOutputDTO> => {
  const club = await clubsRepository.getByUserId(userId);
  if (!club) {
    throw notFound("Club not found for this user");
  }

  const allowedPrefix = `clubs/${club.id}/activities/`;
  if (!input.key.startsWith(allowedPrefix) || input.key.includes("..")) {
    throw validationError("This poster key does not belong to your club.");
  }

  // Only orphaned uploads may be removed — refuse a key that an activity already
  // points at, so this can't be used to wipe a live post's poster.
  if (await activitiesRepository.existsByPosterUrl(getPublicUrl(input.key))) {
    throw validationError("This poster is attached to an activity and cannot be deleted.");
  }

  const result = await deleteImages([input.key]);

  return DeleteActivityPosterOutputDTOSchema.parse({ success: result.errors.length === 0 });
};
