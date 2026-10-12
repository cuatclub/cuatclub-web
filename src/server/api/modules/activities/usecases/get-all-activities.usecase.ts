import { activitiesRepository } from "@/server/api/modules/activities/repositories/activities.repository";
import type {
  GetAllActivitiesInputDTO,
  GetAllActivitiesOutputDTO,
} from "@/server/api/modules/activities/dto";

export const getAllActivities = async (
  input: GetAllActivitiesInputDTO
): Promise<GetAllActivitiesOutputDTO> => {
  const { activities, total } = await activitiesRepository.getAllDetailByFilter(input);

  return {
    activities: activities.map((activity) => activity.toDTO()),
    total,
    page: input.page,
    pageSize: input.pageSize,
  };
};
