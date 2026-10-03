import Image from "next/image";
import {
  Building2,
  ClipboardClock,
  Shapes,
  SquarePen,
  Trash2,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { Tag } from "@/components/ui";
import { cn } from "@/lib/utils";
import { toShortDisplay } from "@/lib/date";
import { YEAR_LEVELS } from "@/app/(site)/club/dashboard/posts/post-schema";
import type { ActivityTypeOption } from "@/app/(site)/club/dashboard/posts/_components/PostForm";
import type { RouterOutputs } from "@/trpc/react";

type Activity = RouterOutputs["activities"]["getMine"]["activities"][number];

const AUDIENCE_LABEL: Record<Activity["audience"], string> = {
  CHULA_STUDENT: "นิสิตจุฬาฯ",
  GENERAL_PUBLIC: "บุคคลทั่วไป",
};

// Mobile's content column (~170px) fits one category; md+ fits three.
const MAX_VISIBLE_CATEGORIES_MOBILE = 1;
const MAX_VISIBLE_CATEGORIES_DESKTOP = 3;

function formatYearLevels(yearLevels: number[]): string {
  if (yearLevels.length === YEAR_LEVELS.length) return "ทุกชั้นปี";
  return `ปี ${[...yearLevels].sort((a, b) => a - b).join(", ")}`;
}

/**
 * `totalFacultyCount` is 0 while master data loads; the guard stops that
 * reading as "all faculties".
 */
function formatFaculties(faculties: Activity["faculties"], totalFacultyCount: number): string {
  if (faculties.length === 0) return "-";
  if (totalFacultyCount > 0 && faculties.length === totalFacultyCount) return "ไม่จำกัดคณะ";
  const [first, ...rest] = faculties;
  if (!first) return "-";
  return rest.length > 0 ? `${first.label} +${rest.length}` : first.label;
}

function formatActivityType(
  activity: Activity,
  activityTypes: readonly ActivityTypeOption[]
): string {
  return activityTypes.find((type) => type.id === activity.activityTypeId)?.label ?? "-";
}

type MetaCellProps = {
  icon: LucideIcon;
  children: React.ReactNode;
};

function MetaCell({ icon: Icon, children }: MetaCellProps) {
  return (
    <div className="text-foreground-muted flex min-w-0 items-center gap-2">
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      <span className="font-ibm-plex truncate text-sm leading-[23px]">{children}</span>
    </div>
  );
}

type PostCardProps = {
  activity: Activity;
  activityTypes: readonly ActivityTypeOption[];
  /** Total number of faculties in master data, used to detect an "all faculties" selection. */
  totalFacultyCount: number;
  clubName: string;
  clubAvatarUrl: string;
  /** Opens the edit dialog. Invoked by the edit button. */
  onEditRequest: () => void;
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
  // The category cap is CSS-only (`hidden md:list-item` / `md:hidden`), not useMediaQuery: that
  // hook stays false after hydration until a resize event, so desktop would show the mobile cap.
  const visibleCategories = activity.categories.slice(0, MAX_VISIBLE_CATEGORIES_DESKTOP);
  const hiddenCategoryCountMobile = activity.categories.length - MAX_VISIBLE_CATEGORIES_MOBILE;
  const hiddenCategoryCountDesktop = activity.categories.length - MAX_VISIBLE_CATEGORIES_DESKTOP;

  return (
    // `contain-inline-size` stops the nowrap tag row's min-content width from widening the
    // dashboard's <main> into horizontal page scroll.
    <div className="flex gap-4 rounded-xl border border-white bg-white p-4 shadow-black contain-inline-size md:gap-5 md:p-6">
      <div className="relative h-[160px] w-[125px] shrink-0 overflow-hidden rounded-xl md:h-[262px] md:w-[205px]">
        <Image
          src={activity.posterUrl}
          alt=""
          fill
          sizes="(min-width: 768px) 205px, 125px"
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {/* `min-w-7` (the avatar's width) keeps the avatar visible while the name truncates. */}
        <div className="flex items-center gap-2">
          <div className="flex min-w-7 flex-1 items-center gap-2">
            <Image
              src={clubAvatarUrl}
              alt=""
              width={28}
              height={28}
              className="size-7 shrink-0 rounded-full object-cover"
            />
            <span className="font-ibm-plex text-foreground truncate text-sm leading-[23px] font-semibold">
              {clubName}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onEditRequest}
              aria-label="แก้ไขโพสต์"
              className="border-primary text-primary hover:bg-primary/10 focus-visible:ring-primary flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <SquarePen aria-hidden="true" className="size-4" />
            </button>
            {/* No delete button on mobile — delete lives in the edit dialog there. */}
            <button
              type="button"
              onClick={onDeleteRequest}
              aria-label="ลบโพสต์"
              className="border-error text-error hover:bg-error/10 focus-visible:ring-error hidden size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:flex"
            >
              <Trash2 aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>

        {/* Mobile: one line, the first label truncates and the +N chip stays beside it;
            md+: wraps. */}
        {visibleCategories.length > 0 && (
          <ul className="flex max-w-full flex-nowrap items-center gap-1.5 md:flex-wrap">
            {visibleCategories.map((category, index) => (
              <li
                key={category.id}
                className={cn(
                  "min-w-0",
                  index >= MAX_VISIBLE_CATEGORIES_MOBILE ? "hidden md:list-item" : undefined
                )}
              >
                <Tag
                  color={category.fontColor}
                  bgColor={category.backgroundColor}
                  className="max-w-full"
                >
                  <span className="truncate">{category.label}</span>
                </Tag>
              </li>
            ))}
            {hiddenCategoryCountMobile > 0 && (
              <li className="shrink-0 md:hidden">
                <Tag>+{hiddenCategoryCountMobile}</Tag>
              </li>
            )}
            {hiddenCategoryCountDesktop > 0 && (
              <li className="hidden shrink-0 md:list-item">
                <Tag>+{hiddenCategoryCountDesktop}</Tag>
              </li>
            )}
          </ul>
        )}

        <h3 className="font-ibm-plex text-foreground line-clamp-2 text-xs leading-5 font-semibold md:text-lg md:leading-[30px]">
          {activity.title}
        </h3>

        <p className="font-ibm-plex text-foreground-muted line-clamp-3 text-[10px] leading-[15px] md:text-sm md:leading-[21px]">
          {activity.description}
        </p>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <MetaCell icon={UsersRound}>
            {AUDIENCE_LABEL[activity.audience]} {formatYearLevels(activity.yearLevels)}
          </MetaCell>
          <MetaCell icon={Building2}>
            {formatFaculties(activity.faculties, totalFacultyCount)}
          </MetaCell>
          <MetaCell icon={Shapes}>{formatActivityType(activity, activityTypes)}</MetaCell>
          <MetaCell icon={ClipboardClock}>
            {toShortDisplay(activity.applicationStartAt)} -{" "}
            {toShortDisplay(activity.applicationEndAt)}
          </MetaCell>
        </div>
      </div>
    </div>
  );
}
