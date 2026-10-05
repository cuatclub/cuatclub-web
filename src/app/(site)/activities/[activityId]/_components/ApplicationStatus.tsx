import { ApplicationCountdown } from "@/app/(site)/activities/[activityId]/_components/ApplicationCountdown";
import { formatShortDate } from "@/app/(site)/activities/_lib";
import { cn } from "@/lib/utils";

/**
 * The design covers open and closed. "upcoming" is an activity whose application window hasn't
 * started yet — the API reports it as not open, but calling it closed would be wrong.
 */
export type ApplicationStatus = "open" | "upcoming" | "closed";

export const getApplicationStatus = (
  activity: { isApplicationOpen: boolean; applicationStartAt: Date },
  now: Date
): ApplicationStatus => {
  if (activity.isApplicationOpen) return "open";
  return now < activity.applicationStartAt ? "upcoming" : "closed";
};

const BADGE: Record<ApplicationStatus, { label: string; toneClass: string }> = {
  open: { label: "เปิดอยู่", toneClass: "text-success" },
  upcoming: { label: "ยังไม่เปิด", toneClass: "text-warning" },
  closed: { label: "ปิดแล้ว", toneClass: "text-error" },
};

type ApplicationStatusBadgeProps = {
  status: ApplicationStatus;
  className?: string;
};

/** The dot-and-word status beside the title. The dot takes the word's color. */
export function ApplicationStatusBadge({ status, className }: ApplicationStatusBadgeProps) {
  const { label, toneClass } = BADGE[status];

  return (
    <p
      className={cn(
        "font-ibm-plex flex shrink-0 items-center gap-2 text-base leading-[26px] font-semibold whitespace-nowrap",
        toneClass,
        className
      )}
    >
      <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-current" />
      {label}
    </p>
  );
}

/** Centered on mobile, where it sits alone between the tags and the poster. */
const MESSAGE_CLASS =
  "font-ibm-plex text-center text-base leading-[26px] font-semibold md:text-left md:text-[22px] md:leading-[36px]";

type ApplicationStatusMessageProps = {
  status: ApplicationStatus;
  applicationStartAt: Date;
  remainingMs: number;
  className?: string;
};

/** The line under the tags: a live countdown while open, a plain notice otherwise. */
export function ApplicationStatusMessage({
  status,
  applicationStartAt,
  remainingMs,
  className,
}: ApplicationStatusMessageProps) {
  if (status === "open") {
    return (
      <ApplicationCountdown
        remainingMs={remainingMs}
        className={cn(MESSAGE_CLASS, "text-error", className)}
      />
    );
  }

  if (status === "upcoming") {
    return (
      <p className={cn(MESSAGE_CLASS, "text-foreground-muted", className)}>
        เปิดรับสมัคร {formatShortDate(applicationStartAt)}
      </p>
    );
  }

  return (
    <p className={cn(MESSAGE_CLASS, "text-error", className)}>กิจกรรมนี้หมดเวลาในการสมัครแล้ว</p>
  );
}
