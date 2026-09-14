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

const formatShortDate = (date: Date): string =>
  `${date.getDate()} ${THAI_MONTHS_SHORT[date.getMonth()]}`;

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
    <div className="border-border flex h-full flex-col gap-4 rounded-xl border border-white bg-white p-4 shadow-black md:flex-row md:gap-5 md:p-4">
      <div className="bg-surface relative h-[180px] w-full shrink-0 overflow-hidden rounded-xl md:h-[262px] md:w-[205px]">
        <Image src={posterUrl} alt="" fill sizes="205px" className="object-cover" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {club.logoUrl ? (
              <Image
                src={club.logoUrl}
                alt=""
                width={32}
                height={32}
                className="size-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div
                aria-hidden="true"
                className="bg-primary-lighter text-primary font-ibm-plex flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              >
                {club.name.charAt(0)}
              </div>
            )}
            <span className="font-ibm-plex text-foreground truncate text-sm font-semibold">
              {club.name}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
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
            <ul className="flex flex-wrap items-center gap-1.5">
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

          <h3 className="font-ibm-plex text-foreground line-clamp-1 text-lg leading-[normal] font-semibold">
            {title}
          </h3>
          <p className="font-ibm-plex text-foreground-muted line-clamp-3 text-sm leading-[1.5]">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <p className="font-ibm-plex text-foreground-muted flex items-center gap-2 text-xs font-medium">
            <Users aria-hidden="true" className="size-4 shrink-0" />
            <span className="truncate">
              {AUDIENCE_LABEL[audience]} {formatYearLevels(yearLevels)}
            </span>
          </p>
          <p className="font-ibm-plex text-foreground-muted flex items-center gap-2 text-xs font-medium">
            <Building2 aria-hidden="true" className="size-4 shrink-0" />
            <span className="truncate">
              {faculties.length === 0 ? "ไม่จำกัดคณะ" : faculties.map((f) => f.label).join(", ")}
            </span>
          </p>
          <p className="font-ibm-plex text-foreground-muted flex items-center gap-2 text-xs font-medium">
            <Shapes aria-hidden="true" className="size-4 shrink-0" />
            <span className="truncate">{isApplicationOpen ? "รับสมัคร" : "ปิดรับสมัคร"}</span>
          </p>
          <p className="font-ibm-plex text-foreground-muted flex items-center gap-2 text-xs font-medium">
            <ClipboardClock aria-hidden="true" className="size-4 shrink-0" />
            <span className="truncate">
              {formatShortDate(applicationStartAt)} - {formatShortDate(applicationEndAt)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
