import {
  UpdateActivityOutputDTOSchema,
  type UpdateActivityInputDTO,
  type UpdateActivityOutputDTO,
} from "@/server/api/modules/activities/dto";
import { activitiesRepository } from "@/server/api/modules/activities/repositories/activities.repository";
import { activityCategoriesRepository } from "@/server/api/modules/activities/repositories/activity-categories.repository";
import { activityFacultiesRepository } from "@/server/api/modules/activities/repositories/activity-faculties.repository";
import { clubsRepository } from "@/server/api/modules/clubs/repositories/clubs.repository";
import { unitOfWork } from "@/server/db/unit-of-work";
import { notFound, validationError } from "@/server/errors";
import { deleteImageWithinPrefix, isKeyWithinPrefix, toR2Key } from "@/server/services/r2";

export const updateActivity = async (
  userId: string,
  input: UpdateActivityInputDTO
): Promise<UpdateActivityOutputDTO> => {
  const club = await clubsRepository.getByUserId(userId);
  if (!club) {
    throw notFound("Club not found for this user");
  }

  // Ownership is enforced structurally (id + clubId) by every repository call
  // below, not by comparing IDs here — this read is only for the old posterUrl.
  const existing = await activitiesRepository.getByIdAndClubId(input.id, club.id);
  if (!existing) {
    throw notFound("Activity post not found for this club");
  }

  // posterUrl is client-supplied: refuse another club's object, or the cleanup below could
  // later delete an image this club never owned.
  const allowedPrefix = `clubs/${club.id}/activities/`;
  if (!isKeyWithinPrefix(toR2Key(input.posterUrl), allowedPrefix)) {
    throw validationError("This poster does not belong to your club.");
  }

  const { id, categoryIds, facultyIds, ...activityInput } = input;

  const updated = await unitOfWork.run(async (client) => {
    const result = await activitiesRepository.updateByIdAndClubId(
      id,
      club.id,
      activityInput,
      client
    );
    if (!result) {
      throw notFound("Activity post not found for this club");
    }

    await activityCategoriesRepository.createActivityCategoryByActivityId(id, categoryIds, client);
    await activityFacultiesRepository.createActivityFacultyByActivityId(id, facultyIds, client);

    return result;
  });

  // After the transaction so it can't roll back with it. Older rows may predate the prefix guard
  // above, so the cleanup re-checks it; keep the object while another activity shares it.
  if (
    existing.posterUrl !== updated.posterUrl &&
    !(await activitiesRepository.existsByPosterUrl(existing.posterUrl))
  ) {
    await deleteImageWithinPrefix(existing.posterUrl, allowedPrefix);
  }

  return UpdateActivityOutputDTOSchema.parse(updated.toDTO());
};
