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
import { cn } from "@/lib/utils";
import { toShortDisplay } from "@/lib/date";
import { YEAR_LEVELS } from "@/app/(site)/club/dashboard/posts/post-schema";
import type { ActivityTypeOption } from "@/app/(site)/club/dashboard/posts/_components/PostForm";
import type { RouterOutputs } from "@/trpc/react";

type Activity = RouterOutputs["activities"]["getMine"]["activities"][number];

const AUDIENCE_LABEL: Record<Activity["audience"], string> = {
  CHULA_STUDENT: "นิสิตจุฬาฯ",
  GENERAL_PUBLIC: "บุคคลทั่วไป",
};

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
  // The visible-category cap depends on the `md` breakpoint, which a JS media-query hook can
  // only apply after hydration (and, per `useMediaQuery`'s docstring, not even reliably then —
  // it only re-evaluates on a `resize`-driven `change` event on the MediaQueryList). That means
  // first paint can't know the cap from JS. Instead, all categories up to the desktop cap are
  // always rendered, and CSS alone (`hidden md:list-item` / `md:hidden`) decides which ones —
  // and which "+N" chip — are actually visible at a given width, so mobile and desktop are each
  // correct from first paint with no client-side correction step.
  const visibleCategories = activity.categories.slice(0, MAX_VISIBLE_CATEGORIES_DESKTOP);
  const hiddenCategoryCountMobile = activity.categories.length - MAX_VISIBLE_CATEGORIES_MOBILE;
  const hiddenCategoryCountDesktop = activity.categories.length - MAX_VISIBLE_CATEGORIES_DESKTOP;

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
      // `contain-inline-size` stops this card's content (specifically the `nowrap` tag list
      // below) from contributing its min-content width to ancestors. Without it, a long
      // untruncated tag label raises this card's intrinsic width, which propagates up the flex
      // chain and widens the dashboard shell's `<main>` past the viewport, causing horizontal
      // page scroll — even though the tag label itself is truncated by CSS.
      className="hover:border-primary-light focus-visible:ring-primary relative flex cursor-pointer gap-4 rounded-xl border border-white bg-white p-4 shadow-black transition-colors contain-inline-size focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:gap-5 md:p-6"
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
        {/* Two different shapes, matching the two Figma variants. On mobile the tags sit at the
            top right of the club-name row (where desktop puts the trash button, which the mobile
            variant doesn't have) — `ml-auto` pushes them there. At `md`+ the design puts the tags
            on their own row below the name, left-aligned: `md:w-full md:flex-none` makes the name
            group claim the whole row so the tag list, the row's other flex child, wraps onto the
            line below. That yields both shapes from one copy of the tag markup.

            The name group takes `min-w-7` — exactly the 28px avatar width, not an arbitrary pixel
            floor — so the row can never shrink the group below the avatar itself; the avatar's
            own `shrink-0` would otherwise let it overflow the group and get painted over by the
            tag list. The name text still truncates inside that floor.

            The tag `ul` is `shrink-0` with `max-w-[calc(100%-36px)]` (36 = the 28px avatar plus
            the 8px row gap): it keeps its natural width — short labels never truncate — and is
            only capped once it would reach into the avatar's space, at which point the first
            category label truncates instead. The name gives up space before the tags do.
            `flex-nowrap` keeps a mobile `+N` chip beside its tag instead of wrapping away; at
            `md`+, `flex-wrap` plus `w-full` and `max-w-full` let extra tags wrap onto more lines
            inside the column instead of overflowing it. */}
        <div className="flex min-w-0 items-center gap-x-2 gap-y-3 overflow-hidden md:flex-wrap md:overflow-visible">
          <div className="flex min-w-7 items-center gap-2 md:w-full md:flex-none">
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
            <ul className="ml-auto flex max-w-[calc(100%-36px)] shrink-0 flex-nowrap items-center gap-1.5 md:ml-0 md:w-full md:max-w-full md:flex-wrap">
              {visibleCategories.map((category, index) => (
                <li
                  key={category.id}
                  // The first `MAX_VISIBLE_CATEGORIES_MOBILE` tags are always shown; the rest,
                  // up to `MAX_VISIBLE_CATEGORIES_DESKTOP`, only appear at `md`+. `min-w-0` lets
                  // the label truncate instead of overflowing the row.
                  className={cn(
                    "min-w-0",
                    index >= MAX_VISIBLE_CATEGORIES_MOBILE ? "hidden md:list-item" : undefined
                  )}
                >
                  <Tag
                    color={category.fontColor}
                    bgColor={category.backgroundColor}
                    className="max-w-full"
                  >
                    <span className="truncate">{category.label}</span>
                  </Tag>
                </li>
              ))}
              {hiddenCategoryCountMobile > 0 && (
                <li className="shrink-0 md:hidden">
                  <Tag>+{hiddenCategoryCountMobile}</Tag>
                </li>
              )}
              {hiddenCategoryCountDesktop > 0 && (
                <li className="hidden shrink-0 md:list-item">
                  <Tag>+{hiddenCategoryCountDesktop}</Tag>
                </li>
              )}
            </ul>
          )}
        </div>

        <h3 className="font-ibm-plex text-foreground line-clamp-2 text-xs leading-5 font-semibold md:text-lg md:leading-[30px]">
          {activity.title}
        </h3>

        <p className="font-ibm-plex text-foreground-muted line-clamp-3 text-[10px] leading-[15px] md:text-sm md:leading-[21px]">
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
