import { Bookmark, CalendarPlus } from "lucide-react";

import { formatFaculties } from "@/app/(site)/activities/_lib/activity-format";
import { ActivityCardView } from "@/features/activities/card/ActivityCardView";
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
};

/**
 * A single activity, in the activity list and in an activity page's related activities. The whole
 * card links to the activity's page.
 */
export function ActivityCard({ id, faculties, activityType, ...card }: ActivityCardProps) {
  return (
    <ActivityCardView
      {...card}
      href={`/activities/${id}`}
      facultyLabel={formatFaculties(faculties)}
      activityTypeLabel={activityType.label}
      actions={
        <div className="hidden shrink-0 items-center gap-1.5 md:flex">
          {/* TODO: wire up once add-to-calendar backend support exists (deferred to a future phase). */}
          <button
            type="button"
            aria-label="เพิ่มลงปฏิทิน"
            className="border-border text-foreground-muted hover:border-primary hover:text-primary flex size-8 cursor-pointer items-center justify-center rounded-lg border-[1.5px] transition-colors"
          >
            <CalendarPlus aria-hidden="true" className="size-4" />
          </button>
          {/* TODO: wire up once save/bookmark backend support exists (deferred to a future phase). */}
          <button
            type="button"
            aria-label="บันทึกกิจกรรม"
            className="border-border text-foreground-muted hover:border-primary hover:text-primary flex size-8 cursor-pointer items-center justify-center rounded-lg border-[1.5px] transition-colors"
          >
            <Bookmark aria-hidden="true" className="size-4" />
          </button>
        </div>
      }
    />
  );
}
