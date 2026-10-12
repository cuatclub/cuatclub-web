import {
  GetMyActivitiesOutputDTOSchema,
  type ActivityListItemDTO,
  type GetMyActivitiesInputDTO,
  type GetMyActivitiesOutputDTO,
} from "@/server/api/modules/activities/dto";
import { activitiesRepository } from "@/server/api/modules/activities/repositories/activities.repository";
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

  const activities = await activitiesRepository.getAllDetailByClubId({
    clubId: club.id,
    search: input.search,
    sort: input.sort,
  });

  const items: ActivityListItemDTO[] = activities.map((detail) => ({
    ...detail.activity.toDTO(),
    categories: detail.categories,
    faculties: detail.faculties,
  }));

  return GetMyActivitiesOutputDTOSchema.parse({ activities: items });
};
