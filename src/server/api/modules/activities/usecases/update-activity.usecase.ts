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
import { deleteImages, isKeyWithinPrefix, toR2Key } from "@/server/services/r2";

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

  // posterUrl arrives from client input and is only shape-checked by the DTO, so a
  // caller could point this post at another club's object. Refuse to store one —
  // otherwise the cleanup below would later delete an image this club never owned.
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

  // Side effect that must not roll back with the DB — runs after the
  // transaction resolves, same ordering as admin-delete-club.usecase.ts.
  // The previous value is re-checked rather than trusted: rows written before the
  // guard above existed may still hold a key outside this club's folder, and those
  // are left alone rather than deleted.
  const previousKey = toR2Key(existing.posterUrl);
  if (existing.posterUrl !== updated.posterUrl && isKeyWithinPrefix(previousKey, allowedPrefix)) {
    await deleteImages([previousKey]);
  }

  return UpdateActivityOutputDTOSchema.parse(updated.toDTO());
};
