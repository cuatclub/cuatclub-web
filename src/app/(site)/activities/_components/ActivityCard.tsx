import { formatFaculties } from "@/app/(site)/activities/_lib/activity-format";
import { ActivityCardView } from "@/features/activities/card/ActivityCardView";
import { AddToCalendarButton } from "@/features/activities/calendar/AddToCalendarButton";
import { SaveActivityButton } from "@/features/activities/save/SaveActivityButton";
import type { RouterOutputs } from "@/trpc/react";

type Activity = RouterOutputs["activities"]["getAll"]["activities"][number];

type ActivityCardProps = {
  id: Activity["id"];
  title: Activity["title"];
  description: Activity["description"];
  posterUrl: Activity["posterUrl"];
  club: Activity["club"];
  categories: Activity["categories"];
  faculties: Activity["faculties"];
  yearLevels: Activity["yearLevels"];
  audience: Activity["audience"];
  activityType: Activity["activityType"];
  applicationStartAt: Activity["applicationStartAt"];
  applicationEndAt: Activity["applicationEndAt"];
  /** Decided by the server — comparing against the clock here could disagree between the
   *  server render and hydration. */
  isApplicationClosed: Activity["isApplicationClosed"];
};

/**
 * A single activity, in the activity list and in an activity page's related activities. The whole
 * card links to the activity's page.
 */
export function ActivityCard({
  id,
  faculties,
  activityType,
  isApplicationClosed,
  ...card
}: ActivityCardProps) {
  return (
    <ActivityCardView
      {...card}
      href={`/activities/${id}`}
      facultyLabel={formatFaculties(faculties)}
      activityTypeLabel={activityType.label}
      actions={
        <div className="hidden shrink-0 items-center gap-1.5 md:flex">
          {/* A deadline that has passed is nothing to put in a calendar. */}
          {!isApplicationClosed && (
            <AddToCalendarButton
              activityId={id}
              title={card.title}
              applicationEndAt={card.applicationEndAt}
            />
          )}
          <SaveActivityButton activityId={id} />
        </div>
      }
    />
  );
}
