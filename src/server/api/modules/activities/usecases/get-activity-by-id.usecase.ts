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
  const detail = await activitiesRepository.getDetailById(input.activityId);

  // An activity is only public while the club that posted it is.
  if (!detail?.isClubPubliclyVisible) throw notFound("Activity not found");

  const categoryIds = detail.categories.map((category) => category.id);
  const relatedActivities = categoryIds.length
    ? await activitiesRepository.getRelatedByCategoryIds({
        excludeActivityId: detail.id,
        categoryIds,
        limit: RELATED_ACTIVITIES_LIMIT,
      })
    : [];
  const shownRelatedActivities =
    relatedActivities.length < RELATED_ACTIVITIES_LIMIT ? [] : relatedActivities;

  const { activity } = detail;

  return {
    id: activity.id,
    title: activity.title,
    description: activity.description,
    posterUrl: activity.posterUrl,
    audience: activity.audience,
    yearLevels: activity.yearLevels,
    applicationFormUrl: activity.applicationFormUrl,
    applicationStartAt: activity.applicationStartAt,
    applicationEndAt: activity.applicationEndAt,
    club: { ...detail.clubSummary, contacts: detail.clubContacts },
    activityType: detail.activityType,
    categories: detail.categories,
    faculties: detail.faculties,
    isApplicationOpen: detail.isApplicationOpen,
    relatedActivities: shownRelatedActivities.map((related) => ({
      id: related.activity.id,
      title: related.activity.title,
      description: related.activity.description,
      posterUrl: related.activity.posterUrl,
      audience: related.activity.audience,
      yearLevels: related.activity.yearLevels,
      activityType: related.activityType,
      categories: related.categories,
      faculties: related.faculties,
      applicationStartAt: related.activity.applicationStartAt,
      applicationEndAt: related.activity.applicationEndAt,
      club: related.clubSummary,
    })),
  };
};
