import { activitiesRepository } from "@/server/api/modules/activities/repositories/activities.repository";
import type {
  GetAllActivitiesInputDTO,
  GetAllActivitiesOutputDTO,
} from "@/server/api/modules/activities/dto";

export const getAllActivities = async (
  input: GetAllActivitiesInputDTO
): Promise<GetAllActivitiesOutputDTO> => {
  const { activities, total } = await activitiesRepository.getAllByFilter(input);

  return {
    activities: activities.map((row) => ({
      id: row.activity.id,
      title: row.activity.title,
      description: row.activity.description,
      posterUrl: row.activity.posterUrl,
      audience: row.activity.audience,
      yearLevels: row.activity.yearLevels,
      applicationStartAt: row.activity.applicationStartAt,
      applicationEndAt: row.activity.applicationEndAt,
      createdAt: row.activity.createdAt,
      isApplicationOpen: row.activity.isApplicationOpen,
      club: row.club,
      categories: row.categories,
      faculties: row.faculties,
      activityType: row.activityType,
    })),
    total,
    page: input.page,
    pageSize: input.pageSize,
  };
};
