"use client";

import { Bookmark } from "lucide-react";

import { Button } from "@/components/ui";
import { useSavedActivity } from "@/features/activities/save/use-saved-activity";
import { cn } from "@/lib/utils";

type SaveActivityButtonProps = {
  activityId: string;
  /** `icon` is the small square on an activity card; `labelled` is the full-width action on an
   *  activity's own page, sized to sit beside the share button. */
  variant?: "icon" | "labelled";
  className?: string;
};

/**
 * Toggles whether the visitor has saved an activity. Saved reads as a filled bookmark in the
 * primary color; the state is also exposed through `aria-pressed`.
 */
export function SaveActivityButton({
  activityId,
  variant = "icon",
  className,
}: SaveActivityButtonProps) {
  const { isSaved, toggle } = useSavedActivity(activityId);

  const icon = (
    <Bookmark
      aria-hidden="true"
      className={cn(
        variant === "icon" ? "size-4" : "size-4 shrink-0 md:size-5",
        isSaved && "fill-current"
      )}
    />
  );

  if (variant === "labelled") {
    return (
      <Button
        type="button"
        variant="outline"
        aria-pressed={isSaved}
        onClick={toggle}
        className={cn("h-9 w-full md:h-10", isSaved && "bg-primary-lighter", className)}
      >
        {icon}
        {isSaved ? "บันทึกแล้ว" : "บันทึก"}
      </Button>
    );
  }

  return (
    <button
      type="button"
      aria-label={isSaved ? "ยกเลิกการบันทึก" : "บันทึกกิจกรรม"}
      aria-pressed={isSaved}
      onClick={toggle}
      className={cn(
        // `relative z-10` lifts the button above the card's stretched title link, which would
        // otherwise swallow the click and open the activity.
        "relative z-10 flex size-8 cursor-pointer items-center justify-center rounded-lg border-[1.5px] transition-colors",
        isSaved
          ? "border-primary text-primary"
          : "border-border text-foreground-muted hover:border-primary hover:text-primary",
        className
      )}
    >
      {icon}
    </button>
  );
}
