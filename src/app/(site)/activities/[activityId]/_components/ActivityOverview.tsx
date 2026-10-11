import Image from "next/image";
import Link from "next/link";

import { ActivityActions } from "@/app/(site)/activities/[activityId]/_components/ActivityActions";
import { ActivityMeta } from "@/app/(site)/activities/[activityId]/_components/ActivityMeta";
import {
  ApplicationStatusBadge,
  ApplicationStatusMessage,
  type ApplicationStatus,
} from "@/app/(site)/activities/[activityId]/_components/ApplicationStatus";
import { Tag } from "@/components/ui/Tag";
import type { RouterOutputs } from "@/trpc/react";

type Activity = RouterOutputs["activities"]["getById"];

type ActivityOverviewProps = {
  activity: Activity;
  status: ApplicationStatus;
  /** Time left to apply as of this render; only meaningful while `status` is "open". */
  remainingMs: number;
};

/**
 * Everything about the activity itself, above the contacts.
 *
 * Desktop splits it into a poster column and a details column. Mobile reads as one column with
 * the poster partway down, between the status line and the details row — so on mobile both column
 * wrappers dissolve (`contents`) and `order` interleaves their children; `md:order-none` hands
 * the order back to the DOM on desktop. One tree, rather than a second copy of the poster and
 * details hidden per breakpoint.
 */
export function ActivityOverview({ activity, status, remainingMs }: ActivityOverviewProps) {
  const { club } = activity;

  return (
    <article className="flex flex-col gap-5 md:flex-row md:items-start md:gap-12">
      <div className="contents md:flex md:w-80 md:shrink-0 md:flex-col md:gap-4">
        <div className="bg-surface relative order-5 aspect-[1173/1500] w-full overflow-hidden rounded-xl md:order-none">
          <Image
            src={activity.posterUrl}
            alt={`โปสเตอร์กิจกรรม ${activity.title}`}
            fill
            priority
            sizes="(min-width: 768px) 320px, calc(100vw - 40px)"
            className="object-cover"
          />
        </div>

        {/* Mobile gets these in the bar pinned to the bottom of the screen instead. */}
        <ActivityActions
          title={activity.title}
          applicationFormUrl={activity.applicationFormUrl}
          isApplicationOpen={status === "open"}
          className="hidden md:flex"
        />
      </div>

      <div className="contents md:flex md:min-w-0 md:flex-1 md:flex-col md:gap-6">
        <div className="contents md:flex md:flex-col md:gap-2">
          <Link
            href={`/clubs/${club.id}`}
            className="group focus-visible:ring-primary order-1 flex w-fit items-center gap-2 rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:order-none"
          >
            {club.logoUrl ? (
              <Image
                src={club.logoUrl}
                alt=""
                width={32}
                height={32}
                className="size-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              // No logo uploaded — stand in with the club's initial rather than a broken frame.
              <div
                aria-hidden="true"
                className="bg-primary-lighter text-primary font-ibm-plex flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              >
                {club.name.charAt(0)}
              </div>
            )}
            {/* IBM Plex Sans Thai's tall ascent rides Latin names ~1.5px above the logo's center at
                16px — the 1px nudge splits the difference with Thai names, which already sit centered. */}
            <span className="font-ibm-plex text-foreground text-sm leading-[23px] font-semibold group-hover:underline md:translate-y-px md:text-base md:leading-[26px]">
              {club.name}
            </span>
          </Link>

          <div className="order-2 flex items-center gap-4 md:order-none">
            <h1 className="font-ibm-plex text-foreground min-w-0 text-2xl leading-[40px] font-semibold break-words md:text-[28px] md:leading-[46px]">
              {activity.title}
            </h1>
            {/* Mobile has no badge — the status line just below says the same thing. */}
            <ApplicationStatusBadge status={status} className="hidden md:flex" />
          </div>

          <ActivityMeta
            audience={activity.audience}
            yearLevels={activity.yearLevels}
            faculties={activity.faculties}
            activityType={activity.activityType}
            applicationStartAt={activity.applicationStartAt}
            applicationEndAt={activity.applicationEndAt}
            className="order-6 md:order-none"
          />
        </div>

        {/* Mobile tucks the tags 8px under the title rather than the column's usual 20px. */}
        {activity.categories.length > 0 && (
          <ul className="order-3 -mt-3 flex flex-wrap items-center gap-1.5 md:order-none md:mt-0">
            {activity.categories.map((category) => (
              <li key={category.id}>
                <Tag
                  color={category.fontColor}
                  bgColor={category.backgroundColor}
                  className="border-0"
                >
                  {category.label}
                </Tag>
              </li>
            ))}
          </ul>
        )}

        <ApplicationStatusMessage
          status={status}
          applicationStartAt={activity.applicationStartAt}
          remainingMs={remainingMs}
          className="order-4 md:order-none"
        />

        <hr className="border-border order-7 md:order-none" />

        <p className="font-th-sarabun text-foreground order-8 text-sm leading-[normal] break-words whitespace-pre-line md:order-none md:text-base md:leading-[1.8]">
          {activity.description}
        </p>
      </div>
    </article>
  );
}
