import {
  ActivityCardSkeleton,
  ActivityGrid,
  ActivityListShell,
} from "@/app/(site)/activities/_components";
import { ACTIVITIES_PER_PAGE } from "@/app/(site)/activities/_lib";

/**
 * Answers a navigation here at once, while the server is still fetching the results the page
 * awaits — without it, the previous page sits frozen until they arrive. Mirrors `ActivityList`'s
 * layout so nothing moves when the real page replaces it.
 *
 * Changes made on the page itself (search, filters, sort, paging) don't come back here: the
 * boundary ignores search params, so the list stays mounted and shows its own skeletons instead.
 *
 * Kept in the `(list)` route group with the page so it covers the list alone. Directly under
 * `activities/` it would also wrap any child route (an activity's own page), which would then
 * flash this list's skeleton while it loads.
 */
export default function ActivityListLoading() {
  return (
    <ActivityListShell>
      <div aria-busy="true" className="flex flex-col gap-8 md:gap-12">
        <div
          aria-hidden="true"
          className="bg-surface mx-auto h-[50px] w-full max-w-[680px] animate-pulse rounded-full"
        />

        {/* The category row's collapsed chips and the sort select — desktop only, as in the list. */}
        <div aria-hidden="true" className="hidden items-start justify-between gap-6 md:flex">
          <div className="flex gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="bg-surface h-[34px] w-20 animate-pulse rounded-full" />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-surface h-[26px] w-14 animate-pulse rounded" />
            <div className="bg-surface h-10 w-[172px] animate-pulse rounded-lg" />
          </div>
        </div>

        <ActivityGrid>
          {Array.from({ length: ACTIVITIES_PER_PAGE }, (_, index) => (
            <ActivityCardSkeleton key={index} />
          ))}
        </ActivityGrid>
      </div>
    </ActivityListShell>
  );
}
