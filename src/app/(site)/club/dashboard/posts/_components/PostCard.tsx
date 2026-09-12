import Image from "next/image";
import {
  Building2,
  ClipboardClock,
  Shapes,
  Trash2,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { Tag } from "@/components/ui";
import { useMediaQuery } from "@/hooks/use-media-query";
import { toShortDisplay } from "@/lib/date";
import { YEAR_LEVELS } from "@/app/(site)/club/dashboard/posts/post-schema";
import type { ActivityTypeOption } from "@/app/(site)/club/dashboard/posts/_components/PostForm";
import type { RouterOutputs } from "@/trpc/react";

type Activity = RouterOutputs["activities"]["getMine"]["activities"][number];

const AUDIENCE_LABEL: Record<Activity["audience"], string> = {
  CHULA_STUDENT: "นิสิตจุฬาฯ",
  GENERAL_PUBLIC: "บุคคลทั่วไป",
};

/** Tailwind's `md`, where the club name and tag list split onto their own rows. */
const DESKTOP_QUERY = "(min-width: 48rem)";

/** On mobile the name+tags row is only ~170px wide, so a single category is all that fits. */
const MAX_VISIBLE_CATEGORIES_MOBILE = 1;
/** At `md`+ the tag list gets its own row below the name, with room for a few tags. */
const MAX_VISIBLE_CATEGORIES_DESKTOP = 3;

function formatYearLevels(yearLevels: number[]): string {
  if (yearLevels.length === YEAR_LEVELS.length) return "ทุกชั้นปี";
  return `ปี ${[...yearLevels].sort((a, b) => a - b).join(", ")}`;
}

/**
 * `totalFacultyCount` comes from a query and is `?? 0` at the call site while it's still
 * loading — guard explicitly so a not-yet-loaded total of `0` never makes a partial (or even
 * empty) selection read as "all faculties".
 */
function formatFaculties(faculties: Activity["faculties"], totalFacultyCount: number): string {
  if (faculties.length === 0) return "-";
  if (totalFacultyCount > 0 && faculties.length === totalFacultyCount) return "ไม่จำกัดคณะ";
  const [first, ...rest] = faculties;
  if (!first) return "-";
  return rest.length > 0 ? `${first.label} +${rest.length}` : first.label;
}

function formatActivityType(
  activity: Activity,
  activityTypes: readonly ActivityTypeOption[]
): string {
  return activityTypes.find((type) => type.id === activity.activityTypeId)?.label ?? "-";
}

type MetaCellProps = {
  icon: LucideIcon;
  children: React.ReactNode;
};

/** Every meta cell is uniform muted grey — there's no status coloring on this card. */
function MetaCell({ icon: Icon, children }: MetaCellProps) {
  return (
    <div className="text-foreground-muted flex min-w-0 items-center gap-2">
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      <span className="font-ibm-plex truncate text-sm leading-[23px]">{children}</span>
    </div>
  );
}

type PostCardProps = {
  activity: Activity;
  activityTypes: readonly ActivityTypeOption[];
  /** Total number of faculties in master data, used to detect an "all faculties" selection. */
  totalFacultyCount: number;
  clubName: string;
  clubAvatarUrl: string;
  /** Opens the details dialog. Invoked by clicking or keyboard-activating the whole card. */
  onOpen: () => void;
  /** Opens the delete confirmation. Must not also trigger `onOpen`. */
  onDeleteRequest: () => void;
};

/**
 * A single post in "My Posts". The whole card opens the details dialog (tech lead: "กดทั้งการ์ด
 * เลย") — it's a `div` with `role="button"` rather than a `Link`/`<button>`, because the trash
 * icon is its own control and a `<button>` can't nest another interactive element.
 */
export function PostCard({
  activity,
  activityTypes,
  totalFacultyCount,
  clubName,
  clubAvatarUrl,
  onOpen,
  onDeleteRequest,
}: PostCardProps) {
  // `useMediaQuery` returns `false` on the server and on the first client render (see its
  // docstring), so querying for desktop — rather than mobile — means that first paint always
  // uses the mobile (1-tag) cap everywhere, including on desktop before hydration. That first
  // paint is a tidy, correct-looking card; it just briefly under-counts on desktop until
  // hydration flips `isDesktop` to `true` and it expands to three tags. Querying for mobile
  // instead would do the opposite: phones would briefly render the clipped three-tag layout
  // this cap exists to prevent. Don't flip this query.
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const maxVisibleCategories = isDesktop
    ? MAX_VISIBLE_CATEGORIES_DESKTOP
    : MAX_VISIBLE_CATEGORIES_MOBILE;
  const visibleCategories = activity.categories.slice(0, maxVisibleCategories);
  const hiddenCategoryCount = activity.categories.length - visibleCategories.length;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // A keydown on the trash button bubbles here too (it's a descendant, not a separate
    // listener) — only the card itself being focused should open the dialog, so the trash
    // button keeps its own Enter/Space activation for deleting instead.
    if (event.target !== event.currentTarget) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onOpen();
  };

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Stops the click from bubbling to the card's own onClick, so deleting never also opens
    // the details dialog.
    event.stopPropagation();
    onDeleteRequest();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      className="hover:border-primary-light focus-visible:ring-primary relative flex cursor-pointer gap-4 rounded-xl border border-white bg-white p-4 shadow-black transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:gap-5 md:p-6"
    >
      {/* Figma's mobile variant has no delete control at all — `hidden` (not just visually
          hidden) below `md` takes it out of the layout and, since `display: none` elements are
          unfocusable, out of the tab order too, without any manual `tabIndex` juggling. */}
      <button
        type="button"
        onClick={handleDeleteClick}
        aria-label="ลบโพสต์"
        className="border-error text-error hover:bg-error/10 focus-visible:ring-error absolute top-4 right-4 hidden size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:top-6 md:right-6 md:flex"
      >
        <Trash2 aria-hidden="true" className="size-4" />
      </button>

      <div className="relative h-[160px] w-[125px] shrink-0 overflow-hidden rounded-xl md:h-[262px] md:w-[205px]">
        {/* Without `sizes`, `fill` defaults to 100vw and Next serves a full-viewport-width image
            into a 205px slot — the widths here match the container above. */}
        <Image
          src={activity.posterUrl}
          alt=""
          fill
          sizes="(min-width: 768px) 205px, 125px"
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 md:pr-12">
        {/* Club name + tags share one row on mobile (name truncates first, tags stay pushed to
            the right via `ml-auto`) but split into two on desktop: `md:w-full md:flex-none`
            forces the name group to claim the whole row width, so the tag list — the row's
            other flex child — has nowhere left to go but wrap onto its own line below, matching
            the desktop-only "name row, then tag row" shape from one copy of the tag markup
            instead of two. The name group takes `min-w-0` so it can shrink below its content
            width. A fixed pixel floor here can only be correct at one viewport: 64px fit the
            402px design frame but overflowed the row by 8px at 375px, because the floor plus the
            tag list simply exceed the available width. What keeps the club identifiable is the
            avatar's own `shrink-0` — the name truncates around it instead of the row spilling. */}
        <div className="flex min-w-0 items-center gap-x-2 gap-y-3 overflow-hidden md:flex-wrap md:overflow-visible">
          <div className="flex min-w-0 items-center gap-2 md:w-full md:flex-none">
            <Image
              src={clubAvatarUrl}
              alt=""
              width={28}
              height={28}
              className="size-7 shrink-0 rounded-full object-cover"
            />
            {/* Dark, not muted: in the frame the club name reads as a heading against the muted
                description below it, the same way the sidebar pairs a dark name with a muted email. */}
            <span className="font-ibm-plex text-foreground truncate text-sm leading-[23px] font-semibold">
              {clubName}
            </span>
          </div>

          {visibleCategories.length > 0 && (
            <ul className="ml-auto flex shrink-0 flex-wrap items-center gap-1.5 md:ml-0">
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
        </div>

        <h3 className="font-ibm-plex text-foreground line-clamp-2 text-lg leading-[30px] font-semibold md:text-xl md:leading-[33px]">
          {activity.title}
        </h3>

        <p className="font-ibm-plex text-foreground-muted line-clamp-3 text-sm leading-[23px] md:text-base md:leading-[26px]">
          {activity.description}
        </p>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <MetaCell icon={UsersRound}>
            {AUDIENCE_LABEL[activity.audience]} {formatYearLevels(activity.yearLevels)}
          </MetaCell>
          <MetaCell icon={Building2}>
            {formatFaculties(activity.faculties, totalFacultyCount)}
          </MetaCell>
          <MetaCell icon={Shapes}>{formatActivityType(activity, activityTypes)}</MetaCell>
          <MetaCell icon={ClipboardClock}>
            {toShortDisplay(activity.applicationStartAt)} -{" "}
            {toShortDisplay(activity.applicationEndAt)}
          </MetaCell>
        </div>
      </div>
    </div>
  );
}
