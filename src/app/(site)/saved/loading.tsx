import { ActivityCardSkeleton, ActivityGrid } from "@/app/(site)/activities/_components";
import { SavedShell } from "@/app/(site)/saved/_components";
import { SAVED_ACTIVITIES_PER_PAGE } from "@/app/(site)/saved/_lib";

/**
 * Answers a navigation here at once, while the server is still fetching the cards the page
 * awaits. Mirrors `SavedList`'s layout so nothing moves when the real page replaces it.
 *
 * Changes made on the page itself (search, paging) don't come back here: the boundary ignores
 * search params, so the list stays mounted and shows its own skeletons instead.
 */
export default function SavedLoading() {
  return (
    <SavedShell>
      <div aria-busy="true" className="flex flex-col gap-6 md:gap-8">
        <div
          aria-hidden="true"
          className="bg-surface h-10 w-full animate-pulse rounded-lg md:max-w-[480px]"
        />
        <ActivityGrid>
          {Array.from({ length: SAVED_ACTIVITIES_PER_PAGE }, (_, index) => (
            <ActivityCardSkeleton key={index} />
          ))}
        </ActivityGrid>
      </div>
    </SavedShell>
  );
}
