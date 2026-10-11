import { ActivityCard } from "@/app/(site)/activities/_components";
import type { RouterOutputs } from "@/trpc/react";

type RelatedActivity = RouterOutputs["activities"]["getById"]["relatedActivities"][number];

type RelatedActivitiesProps = {
  activities: RelatedActivity[];
};

/**
 * The newest activities sharing a category with this one — the API picks them; this only lays
 * them out, in the same card and grid the activity list uses.
 */
export function RelatedActivities({ activities }: RelatedActivitiesProps) {
  return (
    <section aria-labelledby="related-activities-heading" className="flex flex-col gap-3 md:gap-6">
      <h2
        id="related-activities-heading"
        className="font-ibm-plex text-primary text-xl leading-[33px] font-bold md:text-2xl md:leading-[40px]"
      >
        กิจกรรมอื่นๆที่เกี่ยวข้อง
      </h2>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {activities.map((activity) => (
          <li key={activity.id}>
            <ActivityCard
              id={activity.id}
              title={activity.title}
              description={activity.description}
              posterUrl={activity.posterUrl}
              club={activity.club}
              categories={activity.categories}
              faculties={activity.faculties}
              yearLevels={activity.yearLevels}
              audience={activity.audience}
              activityType={activity.activityType}
              applicationStartAt={activity.applicationStartAt}
              applicationEndAt={activity.applicationEndAt}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
