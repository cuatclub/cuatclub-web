import type { ReactNode } from "react";
import { Building2, ClipboardClock, Shapes, Users } from "lucide-react";

import {
  AUDIENCE_LABEL,
  formatFaculties,
  formatShortDate,
  formatYearLevels,
} from "@/app/(site)/activities/_lib";
import { cn } from "@/lib/utils";
import type { RouterOutputs } from "@/trpc/react";

type Activity = RouterOutputs["activities"]["getById"];

const ICON_CLASS = "size-4 shrink-0";

type ActivityMetaProps = {
  audience: Activity["audience"];
  yearLevels: Activity["yearLevels"];
  faculties: Activity["faculties"];
  activityType: Activity["activityType"];
  applicationStartAt: Activity["applicationStartAt"];
  applicationEndAt: Activity["applicationEndAt"];
  className?: string;
};

/**
 * Who can join, from which faculties, what kind of activity, and when applications run. The
 * design shows each as an icon and a value only; the term is kept for screen readers, since a
 * bare "รับสมัคร" or date range means little without it.
 */
export function ActivityMeta({
  audience,
  yearLevels,
  faculties,
  activityType,
  applicationStartAt,
  applicationEndAt,
  className,
}: ActivityMetaProps) {
  const items: { term: string; icon: ReactNode; value: string }[] = [
    {
      term: "ผู้มีสิทธิ์เข้าร่วม",
      icon: <Users aria-hidden="true" className={ICON_CLASS} />,
      value: `${AUDIENCE_LABEL[audience]} ${formatYearLevels(yearLevels)}`,
    },
    {
      term: "คณะ",
      icon: <Building2 aria-hidden="true" className={ICON_CLASS} />,
      value: formatFaculties(faculties),
    },
    {
      term: "ประเภทกิจกรรม",
      icon: <Shapes aria-hidden="true" className={ICON_CLASS} />,
      value: activityType.label,
    },
    {
      term: "ช่วงเวลารับสมัคร",
      icon: <ClipboardClock aria-hidden="true" className={ICON_CLASS} />,
      value: `${formatShortDate(applicationStartAt)} - ${formatShortDate(applicationEndAt)}`,
    },
  ];

  return (
    // A 2×2 grid on mobile; one wrapping row on desktop.
    <dl className={cn("grid grid-cols-2 gap-2 md:flex md:flex-wrap md:gap-x-6", className)}>
      {items.map(({ term, icon, value }) => (
        <div key={term} className="min-w-0">
          <dt className="sr-only">{term}</dt>
          <dd className="font-ibm-plex text-foreground-muted flex items-center gap-2 text-sm leading-[23px] font-medium">
            {icon}
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
