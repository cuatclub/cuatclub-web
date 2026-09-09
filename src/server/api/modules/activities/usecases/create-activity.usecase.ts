import {
  CreateActivityOutputDTOSchema,
  type CreateActivityInputDTO,
  type CreateActivityOutputDTO,
} from "@/server/api/modules/activities/dto";
import { activitiesRepository } from "@/server/api/modules/activities/repositories/activities.repository";
import { activityCategoriesRepository } from "@/server/api/modules/activities/repositories/activity-categories.repository";
import { activityFacultiesRepository } from "@/server/api/modules/activities/repositories/activity-faculties.repository";
import { clubsRepository } from "@/server/api/modules/clubs/repositories/clubs.repository";
import { notFound, validationError } from "@/server/errors";
import { unitOfWork } from "@/server/db/unit-of-work";

export const createActivity = async (
  userId: string,
  input: CreateActivityInputDTO
): Promise<CreateActivityOutputDTO> => {
  const club = await clubsRepository.getByUserId(userId);
  if (!club) {
    throw notFound("Club not found for this user");
  }

  if (!club.isPubliclyVisible) {
    throw validationError("Only a fully registered club can publish an activity post.");
  }

  const { categoryIds, facultyIds, ...activityInput } = input;

  const activity = await unitOfWork.run(async (client) => {
    const created = await activitiesRepository.create(
      { ...activityInput, clubId: club.id },
      client
    );
    await activityCategoriesRepository.createActivityCategoryByActivityId(
      created.id,
      categoryIds,
      client
    );
    await activityFacultiesRepository.createActivityFacultyByActivityId(
      created.id,
      facultyIds,
      client
    );
    return created;
  });

  return CreateActivityOutputDTOSchema.parse(activity);
};
