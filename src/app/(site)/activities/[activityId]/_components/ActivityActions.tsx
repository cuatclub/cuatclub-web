import type { ApplicationStatus } from "@/app/(site)/activities/[activityId]/_components/ApplicationStatus";
import { ShareButton } from "@/app/(site)/activities/[activityId]/_components/ShareButton";
import { Button, buttonVariants } from "@/components/ui/Button";
import { AddToCalendarButton } from "@/features/activities/calendar/AddToCalendarButton";
import { SaveActivityButton } from "@/features/activities/save/SaveActivityButton";
import { cn } from "@/lib/utils";

/** Figma sets the apply label at 16px on every breakpoint, where `Button` drops to 14px on mobile. */
const APPLY_CLASS = "w-full text-base leading-[26px]";

type ActivityActionsProps = {
  activityId: string;
  title: string;
  applicationFormUrl: string;
  applicationEndAt: Date;
  status: ApplicationStatus;
  className?: string;
};

/**
 * Apply, add to calendar, save and share. Rendered twice by the page — under the poster on
 * desktop and in a bar pinned to the bottom of the screen on mobile — and only one of the two is
 * ever visible. Once applications have closed the deadline has passed, so there's nothing left to
 * put in a calendar and that button goes.
 *
 * Follow sits beside them in the design but is deferred to a later phase, so it's left out rather
 * than shown as a button that does nothing.
 */
export function ActivityActions({
  activityId,
  title,
  applicationFormUrl,
  applicationEndAt,
  status,
  className,
}: ActivityActionsProps) {
  const canAddToCalendar = status !== "closed";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {status === "open" ? (
        <a
          href={applicationFormUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants(), APPLY_CLASS)}
        >
          สมัครเลย
          <span className="sr-only"> (เปิดในแท็บใหม่)</span>
        </a>
      ) : (
        // The form may still be reachable, but it no longer counts — so there's nothing to open.
        <Button disabled className={APPLY_CLASS}>
          สมัครเลย
        </Button>
      )}

      <div className={cn("grid gap-3", canAddToCalendar ? "grid-cols-3" : "grid-cols-2")}>
        {canAddToCalendar && (
          <AddToCalendarButton
            activityId={activityId}
            title={title}
            applicationEndAt={applicationEndAt}
            variant="labelled"
          />
        )}
        <SaveActivityButton activityId={activityId} variant="labelled" />
        <ShareButton title={title} />
      </div>
    </div>
  );
}
