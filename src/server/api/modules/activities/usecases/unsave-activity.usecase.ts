import {
  UnsaveActivityOutputDTOSchema,
  type UnsaveActivityInputDTO,
  type UnsaveActivityOutputDTO,
} from "@/server/api/modules/activities/dto";
import { savedActivitiesRepository } from "@/server/api/modules/activities/repositories/saved-activities.repository";

// No existence check: unsaving something that isn't saved (or no longer exists) is already the
// state the caller asked for.
export const unsaveActivity = async (
  userId: string,
  input: UnsaveActivityInputDTO
): Promise<UnsaveActivityOutputDTO> => {
  await savedActivitiesRepository.unsave(userId, input.activityId);

  return UnsaveActivityOutputDTOSchema.parse({ success: true });
};
