import type {
  GetSavedActivitiesInputDTO,
  GetSavedActivitiesOutputDTO,
} from "@/server/api/modules/activities/dto";
import { activitiesRepository } from "@/server/api/modules/activities/repositories/activities.repository";
import { savedActivitiesRepository } from "@/server/api/modules/activities/repositories/saved-activities.repository";

export const getSavedActivities = async (
  userId: string,
  input: GetSavedActivitiesInputDTO
): Promise<GetSavedActivitiesOutputDTO> => {
  const { activityIds, total } = await savedActivitiesRepository.getPageByUserId({
    userId,
    search: input.search,
    page: input.page,
    pageSize: input.pageSize,
  });

  const details = await activitiesRepository.getDetailsByIds(activityIds);
  const detailById = new Map(details.map((detail) => [detail.id, detail]));

  // The details come back in no particular order; the page's order is the save order.
  const activities = activityIds.flatMap((id) => {
    const detail = detailById.get(id);
    return detail ? [detail.toDTO()] : [];
  });

  return { activities, total, page: input.page, pageSize: input.pageSize };
};
