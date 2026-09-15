import Image from "next/image";
import { Bookmark, Building2, CalendarPlus, ClipboardClock, Shapes, Users } from "lucide-react";

import { Tag } from "@/components/ui/Tag";
import { THAI_MONTHS_SHORT } from "@/lib/date";
import type { RouterOutputs } from "@/trpc/react";

type Activity = RouterOutputs["activities"]["getAll"]["activities"][number];

/** Cards share a row height, so only the first couple of categories fit beside the poster. */
const MAX_VISIBLE_CATEGORIES = 2;

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
  isApplicationOpen: Activity["isApplicationOpen"];
};

const AUDIENCE_LABEL: Record<Activity["audience"], string> = {
  CHULA_STUDENT: "นิสิตจุฬาฯ",
  GENERAL_PUBLIC: "บุคคลทั่วไป",
};

const formatYearLevels = (yearLevels: number[]): string =>
  yearLevels.length === 0 ? "ทุกชั้นปี" : yearLevels.map((level) => `ปี ${level}`).join(", ");

/** The app's one domain timezone — the server (often UTC) and a visitor's browser otherwise
 *  disagree on which day an `applicationStartAt`/`applicationEndAt` falls on, which would
 *  desync the server-rendered HTML from the client's hydration render. */
const ACTIVITY_TIME_ZONE = "Asia/Bangkok";

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: ACTIVITY_TIME_ZONE,
  day: "numeric",
  month: "numeric",
});

const formatShortDate = (date: Date): string => {
  const parts = shortDateFormatter.formatToParts(date);
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const month = Number(parts.find((part) => part.type === "month")?.value ?? 1) - 1;
  return `${day} ${THAI_MONTHS_SHORT[month]}`;
};

/**
 * A single activity in the activity list. Unlike `ClubCard` this is not a link — there is no
 * `/activities/[id]` detail page yet.
 */
export function ActivityCard({
  title,
  description,
  posterUrl,
  club,
  categories,
  faculties,
  yearLevels,
  audience,
  applicationStartAt,
  applicationEndAt,
  isApplicationOpen,
}: ActivityCardProps) {
  const visibleCategories = categories.slice(0, MAX_VISIBLE_CATEGORIES);
  const hiddenCategoryCount = categories.length - visibleCategories.length;

  return (
    <div className="border-border flex gap-4 rounded-xl border border-white bg-white p-4 shadow-black md:gap-5">
      <div className="bg-surface relative h-[160px] w-[125px] shrink-0 overflow-hidden rounded-xl md:h-[262px] md:w-[205px]">
        <Image
          src={posterUrl}
          alt=""
          fill
          sizes="(min-width: 768px) 205px, 125px"
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 md:gap-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1 md:gap-2">
            {club.logoUrl ? (
              <Image
                src={club.logoUrl}
                alt=""
                width={24}
                height={24}
                className="size-6 shrink-0 rounded-full object-cover md:size-8"
              />
            ) : (
              <div
                aria-hidden="true"
                className="bg-primary-lighter text-primary font-ibm-plex flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold md:size-8 md:text-sm"
              >
                {club.name.charAt(0)}
              </div>
            )}
            <span className="font-ibm-plex text-foreground truncate text-[10px] font-semibold md:text-sm">
              {club.name}
            </span>
          </div>

          {/* Mobile puts the categories here instead of a row of their own; desktop keeps the
              deferred add-to-calendar/save actions here and shows categories below the header. */}
          {visibleCategories.length > 0 && (
            <ul className="flex shrink-0 flex-wrap items-center justify-end gap-1 md:hidden">
              {visibleCategories.map((category) => (
                <li key={category.id}>
                  <Tag
                    color={category.fontColor}
                    bgColor={category.backgroundColor}
                    className="px-1 py-0.5 text-[10px]"
                  >
                    {category.label}
                  </Tag>
                </li>
              ))}
              {hiddenCategoryCount > 0 && (
                <li>
                  <Tag className="px-1 py-0.5 text-[10px]">+{hiddenCategoryCount}</Tag>
                </li>
              )}
            </ul>
          )}

          <div className="hidden shrink-0 items-center gap-1.5 md:flex">
            {/* TODO: wire up once add-to-calendar backend support exists (deferred to a future phase). */}
            <button
              type="button"
              aria-label="เพิ่มลงปฏิทิน"
              className="border-border text-foreground-muted flex size-8 items-center justify-center rounded-lg border-[1.5px]"
            >
              <CalendarPlus aria-hidden="true" className="size-4" />
            </button>
            {/* TODO: wire up once save/bookmark backend support exists (deferred to a future phase). */}
            <button
              type="button"
              aria-label="บันทึกกิจกรรม"
              className="border-border text-foreground-muted flex size-8 items-center justify-center rounded-lg border-[1.5px]"
            >
              <Bookmark aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          {visibleCategories.length > 0 && (
            <ul className="hidden flex-wrap items-center gap-1.5 md:flex">
              {visibleCategories.map((category) => (
                <li key={category.id}>
                  <Tag color={category.fontColor} bgColor={category.backgroundColor}>
                    {category.label}
                  </Tag>
                </li>
              ))}
              {hiddenCategoryCount > 0 && (
                <li>
                  <Tag>+{hiddenCategoryCount}</Tag>
                </li>
              )}
            </ul>
          )}

          <h3 className="font-ibm-plex text-foreground line-clamp-1 text-xs leading-[normal] font-semibold md:text-lg">
            {title}
          </h3>
          <p className="font-ibm-plex text-foreground-muted line-clamp-4 text-[10px] leading-[1.5] md:line-clamp-3 md:text-sm">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-y-1 md:gap-y-1.5">
          <p className="font-ibm-plex text-foreground-muted flex items-center gap-1 text-[8px] font-medium md:gap-2 md:text-xs">
            <Users aria-hidden="true" className="size-2.5 shrink-0 md:size-4" />
            <span className="truncate">
              {AUDIENCE_LABEL[audience]} {formatYearLevels(yearLevels)}
            </span>
          </p>
          <p className="font-ibm-plex text-foreground-muted flex items-center gap-1 text-[8px] font-medium md:gap-2 md:text-xs">
            <Building2 aria-hidden="true" className="size-2.5 shrink-0 md:size-4" />
            <span className="truncate">
              {faculties.length === 0 ? "ไม่จำกัดคณะ" : faculties.map((f) => f.label).join(", ")}
            </span>
          </p>
          <p className="font-ibm-plex text-foreground-muted flex items-center gap-1 text-[8px] font-medium md:gap-2 md:text-xs">
            <Shapes aria-hidden="true" className="size-2.5 shrink-0 md:size-4" />
            <span className="truncate">{isApplicationOpen ? "รับสมัคร" : "ปิดรับสมัคร"}</span>
          </p>
          <p className="font-ibm-plex text-foreground-muted flex items-center gap-1 text-[8px] font-medium md:gap-2 md:text-xs">
            <ClipboardClock aria-hidden="true" className="size-2.5 shrink-0 md:size-4" />
            <span className="truncate">
              {formatShortDate(applicationStartAt)} - {formatShortDate(applicationEndAt)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
