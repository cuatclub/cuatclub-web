import { ShareButton } from "@/app/(site)/activities/[activityId]/_components/ShareButton";
import { Button, buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/** Figma sets the apply label at 16px on every breakpoint, where `Button` drops to 14px on mobile. */
const APPLY_CLASS = "w-full text-base leading-[26px]";

type ActivityActionsProps = {
  title: string;
  applicationFormUrl: string;
  isApplicationOpen: boolean;
  className?: string;
};

/**
 * Apply and share. Rendered twice by the page — under the poster on desktop and in a bar pinned
 * to the bottom of the screen on mobile — and only one of the two is ever visible.
 *
 * Follow, add-to-calendar, and save sit beside share in the design but are deferred to a later
 * phase, so they're left out rather than shown as buttons that do nothing.
 */
export function ActivityActions({
  title,
  applicationFormUrl,
  isApplicationOpen,
  className,
}: ActivityActionsProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {isApplicationOpen ? (
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

      <ShareButton title={title} />
    </div>
  );
}
