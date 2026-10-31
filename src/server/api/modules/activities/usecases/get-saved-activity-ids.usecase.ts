import {
  GetSavedActivityIdsOutputDTOSchema,
  type GetSavedActivityIdsOutputDTO,
} from "@/server/api/modules/activities/dto";
import { savedActivitiesRepository } from "@/server/api/modules/activities/repositories/saved-activities.repository";

export const getSavedActivityIds = async (
  userId: string
): Promise<GetSavedActivityIdsOutputDTO> => {
  const activityIds = await savedActivitiesRepository.getActivityIdsByUserId(userId);

  return GetSavedActivityIdsOutputDTOSchema.parse({ activityIds });
};
