import { Bookmark, CalendarPlus } from "lucide-react";

import { ActivityCardView } from "@/features/activities/card/ActivityCardView";
import type { RouterOutputs } from "@/trpc/react";

type Activity = RouterOutputs["activities"]["getAll"]["activities"][number];

type ActivityCardProps = {
  title: Activity["title"];
  description: Activity["description"];
  posterUrl: Activity["posterUrl"];
  club: Activity["club"];
  categories: Activity["categories"];
  faculties: Activity["faculties"];
  yearLevels: Activity["yearLevels"];
  audience: Activity["audience"];
  applicationStartAt: Activity["applicationStartAt"];
  applicationEndAt: Activity["applicationEndAt"];
  activityType: Activity["activityType"];
};

const formatFaculties = (faculties: Activity["faculties"]): string => {
  const [first] = faculties;
  if (!first) return "ไม่จำกัดคณะ";
  return faculties.length === 1 ? first.label : `${first.label} และอื่นๆ`;
};

/**
 * A single activity in the activity list. Unlike `ClubCard` this is not a link — there is no
 * `/activities/[id]` detail page yet.
 */
export function ActivityCard({ faculties, activityType, ...card }: ActivityCardProps) {
  return (
    <ActivityCardView
      {...card}
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
