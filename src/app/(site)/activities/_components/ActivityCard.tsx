import Image from "next/image";
import Link from "next/link";
import { Bookmark, Building2, CalendarPlus, ClipboardClock, Shapes, Users } from "lucide-react";

import {
  AUDIENCE_LABEL,
  formatFaculties,
  formatShortDate,
  formatYearLevels,
} from "@/app/(site)/activities/_lib/activity-format";
import { Tag } from "@/components/ui/Tag";
import type { RouterOutputs } from "@/trpc/react";

type Activity = RouterOutputs["activities"]["getAll"]["activities"][number];

/** Cards share a row height, so only the first few categories fit — one on a phone, where they
 *  sit beside the club name, and two on desktop, where they get a row of their own. */
const MOBILE_MAX_VISIBLE_CATEGORIES = 1;
const DESKTOP_MAX_VISIBLE_CATEGORIES = 2;

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

/** Figma sizes the tag by breakpoint and drops the border `Tag` adds around its fill. */
const MOBILE_TAG_CLASS = "border-0 px-1 py-0.5 text-[10px] leading-[normal] font-medium";
const DESKTOP_TAG_CLASS =
  "border-0 px-3 py-1 text-xs leading-[normal] font-medium md:text-xs md:leading-[normal]";

/** Mobile rows are a fixed 20px tall with no row gap; desktop spaces them by 6px instead. */
const FOOTER_ITEM_CLASS =
  "font-ibm-plex text-foreground-muted flex min-h-5 items-center gap-1 text-[8px] font-medium md:min-h-0 md:gap-2 md:text-xs";

/**
 * A single activity, in the activity list and in an activity page's related activities. Unlike
 * `ClubCard` the card can't be one `<Link>` — it holds buttons, which can't nest inside an
 * anchor — so the title is the link and its `::after` stretches over the whole card instead.
 */
export function ActivityCard({
  id,
  title,
  description,
  posterUrl,
  club,
  categories,
  faculties,
  yearLevels,
  audience,
  activityType,
  applicationStartAt,
  applicationEndAt,
}: ActivityCardProps) {
  const mobileCategories = categories.slice(0, MOBILE_MAX_VISIBLE_CATEGORIES);
  const mobileHiddenCount = categories.length - mobileCategories.length;
  const desktopCategories = categories.slice(0, DESKTOP_MAX_VISIBLE_CATEGORIES);
  const desktopHiddenCount = categories.length - desktopCategories.length;

  return (
    <div className="border-border hover:border-primary-light has-[a:focus-visible]:ring-primary relative flex gap-4 rounded-xl border border-white bg-white p-4 shadow-black transition-colors has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-offset-2 md:gap-5">
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

          {/* Mobile puts the categories here instead of a row of their own; desktop keeps the
              deferred add-to-calendar/save actions here and shows categories below the header. */}
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

          <div className="hidden shrink-0 items-center gap-1.5 md:flex">
            {/* TODO: wire up once add-to-calendar backend support exists (deferred to a future phase). */}
            <button
              type="button"
              aria-label="เพิ่มลงปฏิทิน"
              className="border-border text-foreground-muted hover:bg-primary-lighter hover:text-primary flex size-8 cursor-pointer items-center justify-center rounded-lg border-[1.5px] transition-colors"
            >
              <CalendarPlus aria-hidden="true" className="size-4" />
            </button>
            {/* TODO: wire up once save/bookmark backend support exists (deferred to a future phase). */}
            <button
              type="button"
              aria-label="บันทึกกิจกรรม"
              className="border-border text-foreground-muted hover:bg-primary-lighter hover:text-primary flex size-8 cursor-pointer items-center justify-center rounded-lg border-[1.5px] transition-colors"
            >
              <Bookmark aria-hidden="true" className="size-4" />
            </button>
          </div>
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
              <Link
                href={`/activities/${id}`}
                className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none"
              >
                {title}
              </Link>
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
            <span className="truncate">{formatFaculties(faculties)}</span>
          </p>
          <p className={FOOTER_ITEM_CLASS}>
            <Shapes aria-hidden="true" className="size-2.5 shrink-0 md:size-4" />
            <span className="truncate">{activityType.label}</span>
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
