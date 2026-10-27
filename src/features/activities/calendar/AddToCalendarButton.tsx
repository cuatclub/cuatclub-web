"use client";

import { CalendarPlus } from "lucide-react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import {
  buildApplicationDeadlineEvent,
  buildGoogleCalendarUrl,
  buildOutlookCalendarUrl,
} from "@/features/activities/calendar/application-deadline-event";
import { cn } from "@/lib/utils";

type AddToCalendarButtonProps = {
  activityId: string;
  title: string;
  applicationEndAt: Date;
  /** `icon` is the small square on an activity card; `labelled` is the full-width action on an
   *  activity's own page, sized to sit beside the save and share buttons. */
  variant?: "icon" | "labelled";
  className?: string;
};

/**
 * Opens a menu of calendars to add the activity's application deadline to. Activities have no
 * date of their own, so the entry is an all-day one on the closing day.
 */
export function AddToCalendarButton({
  activityId,
  title,
  applicationEndAt,
  variant = "icon",
  className,
}: AddToCalendarButtonProps) {
  const icon = (
    <CalendarPlus
      aria-hidden="true"
      className={variant === "icon" ? "size-4" : "size-4 shrink-0 md:size-5"}
    />
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "labelled" ? (
          <Button type="button" variant="outline" className={cn("h-9 w-full md:h-10", className)}>
            {icon}
            ปฏิทิน
          </Button>
        ) : (
          <button
            type="button"
            aria-label="เพิ่มลงปฏิทิน"
            className={cn(
              // `relative z-10` lifts the button above the card's stretched title link, which would
              // otherwise swallow the click and open the activity.
              "border-border text-foreground-muted hover:border-primary hover:text-primary data-[state=open]:border-primary data-[state=open]:text-primary relative z-10 flex size-8 cursor-pointer items-center justify-center rounded-lg border-[1.5px] transition-colors",
              className
            )}
          >
            {icon}
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align={variant === "labelled" ? "start" : "end"}>
        <CalendarMenuItems
          activityId={activityId}
          title={title}
          applicationEndAt={applicationEndAt}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Only rendered while the menu is open, so reading `window.location` can't desync the
 *  server-rendered HTML from hydration. */
function CalendarMenuItems({
  activityId,
  title,
  applicationEndAt,
}: Pick<AddToCalendarButtonProps, "activityId" | "title" | "applicationEndAt">) {
  const event = buildApplicationDeadlineEvent(
    { id: activityId, title, applicationEndAt },
    window.location.origin
  );

  const webCalendars = [
    { label: "Google Calendar", href: buildGoogleCalendarUrl(event) },
    // Both are "Outlook" to people; what tells them apart is which account they sign in with.
    { label: "Outlook (บัญชีส่วนตัว)", href: buildOutlookCalendarUrl(event, "personal") },
    { label: "Outlook (บัญชีจุฬาฯ / ที่ทำงาน)", href: buildOutlookCalendarUrl(event, "work") },
  ];

  return (
    <>
      {webCalendars.map(({ label, href }) => (
        <DropdownMenuItem key={label} asChild>
          <a href={href} target="_blank" rel="noopener noreferrer">
            {label}
            <span className="sr-only"> (เปิดในแท็บใหม่)</span>
          </a>
        </DropdownMenuItem>
      ))}
      <DropdownMenuItem asChild>
        <a href={`/activities/${activityId}/calendar.ics`}>Apple Calendar / อื่นๆ (.ics)</a>
      </DropdownMenuItem>
    </>
  );
}
