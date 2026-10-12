import {
  ClubCardSkeleton,
  ClubGrid,
  ClubListShell,
  ClubSearchBar,
} from "@/app/(site)/clubs/_components";
import { CLUBS_PER_PAGE } from "@/app/(site)/clubs/_lib";

/**
 * Answers a navigation here at once, while the server is still fetching the results the page
 * awaits — without it, the previous page sits frozen until they arrive. Mirrors `ClubList`'s
 * layout so nothing moves when the real page replaces it.
 *
 * Changes made on the page itself (search, filters, sort, paging) don't come back here: the
 * boundary ignores search params, so the list stays mounted and shows its own skeletons instead.
 *
 * Kept in the `(list)` route group with the page so it covers the list alone. Directly under
 * `clubs/` it would also wrap `[clubId]`, and opening a club would flash this list's skeleton.
 */
export default function ClubListLoading() {
  return (
    <ClubListShell>
      <div aria-busy="true" className="flex flex-col gap-8 md:gap-12">
        {/* The real bar, not a skeleton: it needs nothing from the results, so it can be used at once. */}
        <div className="mx-auto w-full max-w-[680px]">
          <ClubSearchBar defaultValue="" isFilterOpen={false} activeFilterCount={0} />
        </div>

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

        <ClubGrid>
          {Array.from({ length: CLUBS_PER_PAGE }, (_, index) => (
            <ClubCardSkeleton key={index} />
          ))}
        </ClubGrid>
      </div>
    </ClubListShell>
  );
}
