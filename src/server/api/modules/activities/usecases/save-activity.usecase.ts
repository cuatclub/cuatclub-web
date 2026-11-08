import {
  SaveActivityOutputDTOSchema,
  type SaveActivityInputDTO,
  type SaveActivityOutputDTO,
} from "@/server/api/modules/activities/dto";
import { activitiesRepository } from "@/server/api/modules/activities/repositories/activities.repository";
import { savedActivitiesRepository } from "@/server/api/modules/activities/repositories/saved-activities.repository";
import { notFound } from "@/server/errors";

export const saveActivity = async (
  userId: string,
  input: SaveActivityInputDTO
): Promise<SaveActivityOutputDTO> => {
  if (!(await activitiesRepository.existsPubliclyVisibleById(input.activityId))) {
    throw notFound("Activity not found");
  }

  await savedActivitiesRepository.save(userId, input.activityId);

  return SaveActivityOutputDTOSchema.parse({ success: true });
};
