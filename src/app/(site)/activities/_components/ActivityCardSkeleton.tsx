/**
 * Mirrors `ActivityCard`'s shape so the grid doesn't resize once the real results arrive — the
 * list shows it while results load, and `loading.tsx` while the whole page does. The heights are
 * the card's own: its 262px poster sets them on a desktop, its four-line description (a little
 * taller than the 160px poster) on a phone.
 */
export function ActivityCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="border-border flex h-[198px] gap-4 rounded-xl border bg-white p-4 md:h-[296px] md:gap-5"
    >
      <div className="bg-surface h-[160px] w-[125px] shrink-0 animate-pulse rounded-xl md:h-full md:w-[205px]" />
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-surface size-6 shrink-0 animate-pulse rounded-full md:size-8" />
          <div className="bg-surface h-4 w-20 animate-pulse rounded" />
        </div>
        <div className="bg-surface h-6 w-2/5 animate-pulse rounded" />
        <div className="bg-surface h-4 w-full animate-pulse rounded" />
        <div className="bg-surface h-4 w-full animate-pulse rounded" />
        <div className="bg-surface h-4 w-3/4 animate-pulse rounded" />
      </div>
    </div>
  );
}
