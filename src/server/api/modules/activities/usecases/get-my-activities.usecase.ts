import {
  GetMyActivitiesOutputDTOSchema,
  type ActivityListItemDTO,
  type GetMyActivitiesInputDTO,
  type GetMyActivitiesOutputDTO,
} from "@/server/api/modules/activities/dto";
import { activitiesRepository } from "@/server/api/modules/activities/repositories/activities.repository";
import { activityCategoriesRepository } from "@/server/api/modules/activities/repositories/activity-categories.repository";
import { activityFacultiesRepository } from "@/server/api/modules/activities/repositories/activity-faculties.repository";
import { clubsRepository } from "@/server/api/modules/clubs/repositories/clubs.repository";
import { notFound } from "@/server/errors";

export const getMyActivities = async (
  userId: string,
  input: GetMyActivitiesInputDTO
): Promise<GetMyActivitiesOutputDTO> => {
  const club = await clubsRepository.getByUserId(userId);
  if (!club) {
    throw notFound("Club not found for this user");
  }

  const activities = await activitiesRepository.getAllByClubId({
    clubId: club.id,
    search: input.search,
    sort: input.sort,
  });

  if (activities.length === 0) {
    return GetMyActivitiesOutputDTOSchema.parse({ activities: [] });
  }

  const activityIds = activities.map((activity) => activity.id);
  const [categoriesByActivityId, facultiesByActivityId] = await Promise.all([
    activityCategoriesRepository.getCategoriesByActivityIds(activityIds),
    activityFacultiesRepository.getFacultiesByActivityIds(activityIds),
  ]);

  const items: ActivityListItemDTO[] = activities.map((activity) => ({
    ...activity.toDTO(),
    categories: categoriesByActivityId.get(activity.id) ?? [],
    faculties: facultiesByActivityId.get(activity.id) ?? [],
  }));

  return GetMyActivitiesOutputDTOSchema.parse({ activities: items });
};
