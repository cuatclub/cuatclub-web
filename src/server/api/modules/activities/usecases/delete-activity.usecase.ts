import {
  DeleteActivityOutputDTOSchema,
  type DeleteActivityInputDTO,
  type DeleteActivityOutputDTO,
} from "@/server/api/modules/activities/dto";
import { activitiesRepository } from "@/server/api/modules/activities/repositories/activities.repository";
import { clubsRepository } from "@/server/api/modules/clubs/repositories/clubs.repository";
import { notFound } from "@/server/errors";
import { deleteImages, isKeyWithinPrefix, toR2Key } from "@/server/services/r2";

export const deleteActivity = async (
  userId: string,
  input: DeleteActivityInputDTO
): Promise<DeleteActivityOutputDTO> => {
  const club = await clubsRepository.getByUserId(userId);
  if (!club) {
    throw notFound("Club not found for this user");
  }

  const existing = await activitiesRepository.getByIdAndClubId(input.id, club.id);
  if (!existing) {
    throw notFound("Activity post not found for this club");
  }

  // activity_categories / activity_faculties rows cascade with the activity.
  const deleted = await activitiesRepository.deleteByIdAndClubId(input.id, club.id);
  if (!deleted) {
    throw notFound("Activity post not found for this club");
  }

  // posterUrl is client-supplied, so only delete an object inside this club's own folder.
  const posterKey = toR2Key(existing.posterUrl);
  if (isKeyWithinPrefix(posterKey, `clubs/${club.id}/activities/`)) {
    await deleteImages([posterKey]);
  }

  return DeleteActivityOutputDTOSchema.parse({ success: true });
};
