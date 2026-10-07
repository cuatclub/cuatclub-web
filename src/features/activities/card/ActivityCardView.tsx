import Image from "next/image";
import { Building2, ClipboardClock, Shapes, Users } from "lucide-react";

import { Tag } from "@/components/ui/Tag";
import { THAI_MONTHS_SHORT } from "@/lib/date";

/** Cards share a row height, so only the first few categories fit — one on a phone, where they
 *  sit beside the club name, and two on desktop, where they get a row of their own. */
const MOBILE_MAX_VISIBLE_CATEGORIES = 1;
const DESKTOP_MAX_VISIBLE_CATEGORIES = 2;

const AUDIENCE_LABEL = {
  CHULA_STUDENT: "นิสิตจุฬาฯ",
  GENERAL_PUBLIC: "บุคคลทั่วไป",
} as const;

/** Figma sizes the tag by breakpoint and drops the border `Tag` adds around its fill. */
const MOBILE_TAG_CLASS = "border-0 px-1 py-0.5 text-[10px] leading-[normal] font-medium";
const DESKTOP_TAG_CLASS =
  "border-0 px-3 py-1 text-xs leading-[normal] font-medium md:text-xs md:leading-[normal]";

/** Mobile rows are a fixed 20px tall with no row gap; desktop spaces them by 6px instead. */
const FOOTER_ITEM_CLASS =
  "font-ibm-plex text-foreground-muted flex min-h-5 items-center gap-1 text-[8px] font-medium md:min-h-0 md:gap-2 md:text-xs";

const TOTAL_YEAR_LEVELS = 4;

/** Consecutive years collapse to a range ("ปี 1-3"); gaps stay listed ("ปี 1, 3"). */
const formatYearLevels = (yearLevels: number[]): string => {
  const sorted = [...new Set(yearLevels)].sort((a, b) => a - b);
  if (sorted.length === 0 || sorted.length === TOTAL_YEAR_LEVELS) return "ทุกชั้นปี";

  const runs: { start: number; end: number }[] = [];
  for (const level of sorted) {
    const lastRun = runs[runs.length - 1];
    if (lastRun?.end === level - 1) lastRun.end = level;
    else runs.push({ start: level, end: level });
  }

  const parts = runs.map(({ start, end }) => (start === end ? `${start}` : `${start}-${end}`));
  return `ปี ${parts.join(", ")}`;
};

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

export type ActivityCardViewProps = {
  title: string;
  description: string;
  posterUrl: string;
  club: { name: string; logoUrl: string | null };
  categories: {
    id: number;
    label: string;
    fontColor: string;
    backgroundColor: string;
  }[];
  audience: keyof typeof AUDIENCE_LABEL;
  yearLevels: number[];
  /** Already formatted — "all faculties" is decided by the caller, which knows the master data. */
  facultyLabel: string;
  activityTypeLabel: string;
  applicationStartAt: Date;
  applicationEndAt: Date;
  /** Buttons at the header's right edge. The slot sits beside the mobile categories, so a
   *  caller that wants it hidden on mobile hides its own element. */
  actions?: React.ReactNode;
};

/**
 * The presentational activity card shared by the public activity list and "My Posts". It owns the
 * layout and formatting only; each caller supplies already-resolved data and its own `actions`.
 */
export function ActivityCardView({
  title,
  description,
  posterUrl,
  club,
  categories,
  audience,
  yearLevels,
  facultyLabel,
  activityTypeLabel,
  applicationStartAt,
  applicationEndAt,
  actions,
}: ActivityCardViewProps) {
  const mobileCategories = categories.slice(0, MOBILE_MAX_VISIBLE_CATEGORIES);
  const mobileHiddenCount = categories.length - mobileCategories.length;
  const desktopCategories = categories.slice(0, DESKTOP_MAX_VISIBLE_CATEGORIES);
  const desktopHiddenCount = categories.length - desktopCategories.length;

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
        <div className="flex items-center justify-between gap-2 md:items-start">
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

          {/* Mobile puts the categories here instead of a row of their own; desktop shows them
              below the header. */}
          {mobileCategories.length > 0 && (
            <ul className="flex shrink-0 flex-wrap items-center justify-end gap-1 md:hidden">
              {mobileCategories.map((category) => (
                <li key={category.id}>
                  <Tag
                    color={category.fontColor}
                    bgColor={category.backgroundColor}
                    className={MOBILE_TAG_CLASS}
                  >
                    {category.label}
                  </Tag>
                </li>
              ))}
              {mobileHiddenCount > 0 && (
                <li>
                  <Tag className={MOBILE_TAG_CLASS}>+{mobileHiddenCount}</Tag>
                </li>
              )}
            </ul>
          )}

          {actions}
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          {desktopCategories.length > 0 && (
            <ul className="hidden flex-wrap items-center gap-1.5 md:flex">
              {desktopCategories.map((category) => (
                <li key={category.id}>
                  <Tag
                    color={category.fontColor}
                    bgColor={category.backgroundColor}
                    className={DESKTOP_TAG_CLASS}
                  >
                    {category.label}
                  </Tag>
                </li>
              ))}
              {desktopHiddenCount > 0 && (
                <li>
                  <Tag className={DESKTOP_TAG_CLASS}>+{desktopHiddenCount}</Tag>
                </li>
              )}
            </ul>
          )}

          <div className="flex flex-col gap-1">
            <h3 className="font-ibm-plex text-foreground line-clamp-1 text-xs leading-[normal] font-semibold md:text-lg">
              {title}
            </h3>
            <p className="font-ibm-plex text-foreground-muted line-clamp-4 text-[10px] leading-[1.5] md:text-sm">
              {description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 items-center gap-x-1 md:gap-x-0 md:gap-y-1.5">
          <p className={FOOTER_ITEM_CLASS}>
            <Users aria-hidden="true" className="size-2.5 shrink-0 md:size-4" />
            <span className="truncate">
              {AUDIENCE_LABEL[audience]} {formatYearLevels(yearLevels)}
            </span>
          </p>
          <p className={FOOTER_ITEM_CLASS}>
            <Building2 aria-hidden="true" className="size-2.5 shrink-0 md:size-4" />
            <span className="truncate">{facultyLabel}</span>
          </p>
          <p className={FOOTER_ITEM_CLASS}>
            <Shapes aria-hidden="true" className="size-2.5 shrink-0 md:size-4" />
            <span className="truncate">{activityTypeLabel}</span>
          </p>
          <p className={FOOTER_ITEM_CLASS}>
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
