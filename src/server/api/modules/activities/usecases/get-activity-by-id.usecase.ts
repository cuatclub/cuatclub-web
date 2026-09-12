import { activitiesRepository } from "@/server/api/modules/activities/repositories/activities.repository";
import type {
  GetActivityByIdInputDTO,
  GetActivityByIdOutputDTO,
} from "@/server/api/modules/activities/dto";
import { notFound } from "@/server/errors";

// "Related" means the most recently posted activities that share at least one category with
// this one — category overlap is the closest signal the schema carries for a similar activity,
// and recency breaks the tie. Activities of clubs that aren't publicly visible are excluded.
const RELATED_ACTIVITIES_LIMIT = 4;

export const getActivityById = async (
  input: GetActivityByIdInputDTO
): Promise<GetActivityByIdOutputDTO> => {
  const activity = await activitiesRepository.getDetailById(input.activityId);

  // An activity is only public while the club that posted it is.
  if (!activity?.isClubPubliclyVisible) throw notFound("Activity not found");

  const categoryIds = activity.categories.map((category) => category.id);
  const relatedActivities = categoryIds.length
    ? await activitiesRepository.getRelatedByCategoryIds({
        excludeActivityId: activity.id,
        categoryIds,
        limit: RELATED_ACTIVITIES_LIMIT,
      })
    : [];

  return {
    ...activity.toDTO(),
    relatedActivities: relatedActivities.map((related) => ({
      id: related.id,
      title: related.title,
      description: related.description,
      posterUrl: related.posterUrl,
      audience: related.audience,
      yearLevels: related.yearLevels,
      activityType: related.activityType,
      categories: related.categories,
      faculties: related.faculties,
      applicationStartAt: related.applicationStartAt,
      applicationEndAt: related.applicationEndAt,
      club: { id: related.clubId, name: related.clubName, logoUrl: related.clubLogoUrl },
    })),
  };
};
