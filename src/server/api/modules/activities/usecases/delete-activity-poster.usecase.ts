import {
  DeleteActivityPosterOutputDTOSchema,
  type DeleteActivityPosterInputDTO,
  type DeleteActivityPosterOutputDTO,
} from "@/server/api/modules/activities/dto";
import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import { deleteImages } from "@/server/services/r2";
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

  const result = await deleteImages([input.key]);

  return DeleteActivityPosterOutputDTOSchema.parse({ success: result.errors.length === 0 });
};
