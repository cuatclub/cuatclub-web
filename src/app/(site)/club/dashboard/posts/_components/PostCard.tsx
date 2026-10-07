import { SquarePen, Trash2 } from "lucide-react";

import { ActivityCardView } from "@/features/activities/card/ActivityCardView";
import type { ActivityTypeOption } from "@/app/(site)/club/dashboard/posts/_components/PostForm";
import type { RouterOutputs } from "@/trpc/react";

type Activity = RouterOutputs["activities"]["getMine"]["activities"][number];

/**
 * `totalFacultyCount` is 0 while master data loads; the guard stops that
 * reading as "all faculties".
 */
function formatFaculties(faculties: Activity["faculties"], totalFacultyCount: number): string {
  if (faculties.length === 0) return "-";
  if (totalFacultyCount > 0 && faculties.length === totalFacultyCount) return "ไม่จำกัดคณะ";
  const [first, ...rest] = faculties;
  if (!first) return "-";
  return rest.length > 0 ? `${first.label} และอื่นๆ` : first.label;
}

function formatActivityType(
  activity: Activity,
  activityTypes: readonly ActivityTypeOption[]
): string {
  return activityTypes.find((type) => type.id === activity.activityTypeId)?.label ?? "-";
}

type PostCardProps = {
  activity: Activity;
  activityTypes: readonly ActivityTypeOption[];
  /** Total number of faculties in master data, used to detect an "all faculties" selection. */
  totalFacultyCount: number;
  clubName: string;
  clubAvatarUrl: string;
  /** Called with the edit button, so focus can return to it when the dialog closes. */
  onEditRequest: (trigger: HTMLButtonElement) => void;
  onDeleteRequest: () => void;
};

/** A post in "My Posts". The card isn't clickable — edit and delete have their own buttons. */
export function PostCard({
  activity,
  activityTypes,
  totalFacultyCount,
  clubName,
  clubAvatarUrl,
  onEditRequest,
  onDeleteRequest,
}: PostCardProps) {
  return (
    <ActivityCardView
      title={activity.title}
      description={activity.description}
      posterUrl={activity.posterUrl}
      club={{ name: clubName, logoUrl: clubAvatarUrl }}
      categories={activity.categories}
      audience={activity.audience}
      yearLevels={activity.yearLevels}
      facultyLabel={formatFaculties(activity.faculties, totalFacultyCount)}
      activityTypeLabel={formatActivityType(activity, activityTypes)}
      applicationStartAt={activity.applicationStartAt}
      applicationEndAt={activity.applicationEndAt}
      actions={
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={(event) => onEditRequest(event.currentTarget)}
            aria-label="แก้ไขโพสต์"
            className="border-border text-foreground-muted hover:border-primary hover:text-primary flex size-8 cursor-pointer items-center justify-center rounded-lg border-[1.5px] transition-colors"
          >
            <SquarePen aria-hidden="true" className="size-3 md:size-4" />
          </button>
          {/* No delete button on mobile — delete lives in the edit dialog there. */}
          <button
            type="button"
            onClick={onDeleteRequest}
            aria-label="ลบโพสต์"
            className="border-border text-foreground-muted hover:border-primary hover:text-primary flex size-8 cursor-pointer items-center justify-center rounded-lg border-[1.5px] transition-colors"
          >
            <Trash2 aria-hidden="true" className="size-4" />
          </button>
        </div>
      }
    />
  );
}
