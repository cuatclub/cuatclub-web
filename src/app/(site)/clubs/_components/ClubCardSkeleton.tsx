/**
 * Mirrors the card's own shape so the grid doesn't resize once the real results arrive — the list
 * shows it while results load, and `loading.tsx` while the whole page does.
 */
export function ClubCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="border-border flex h-[253px] flex-col gap-4 rounded-xl border bg-white p-4 md:h-[311px] md:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="bg-surface size-12 shrink-0 animate-pulse rounded-full md:size-14" />
        <div className="bg-surface h-7 w-24 animate-pulse rounded-full" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="bg-surface h-6 w-2/5 animate-pulse rounded" />
        <div className="bg-surface h-4 w-full animate-pulse rounded" />
        <div className="bg-surface h-4 w-full animate-pulse rounded" />
        <div className="bg-surface h-4 w-3/4 animate-pulse rounded" />
      </div>
      <div className="border-border mt-auto border-t" />
      <div className="bg-surface h-5 w-1/3 animate-pulse rounded" />
    </div>
  );
}
