"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData } from "@tanstack/react-query";
import { SearchX } from "lucide-react";

import { CategoryFilterRow } from "@/app/clubs/_components/CategoryFilterRow";
import { ClubCard } from "@/app/clubs/_components/ClubCard";
import { ClubFilterModal } from "@/app/clubs/_components/ClubFilterModal";
import { ClubSearchBar } from "@/app/clubs/_components/ClubSearchBar";
import { ClubSortSelect } from "@/app/clubs/_components/ClubSortSelect";
import {
  buildClubListQuery,
  CLUBS_PER_PAGE,
  parseClubListParams,
  toClubsQueryInput,
  type ClubListParams,
} from "@/app/clubs/_lib/club-list-params";
import { Pagination } from "@/components/ui/Pagination";
import { api } from "@/trpc/react";

/**
 * The interactive half of the club list. Every control writes to the URL and the list reads back
 * from it, so there is one source of truth and a filtered view is always a shareable link.
 */
export function ClubList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [extraPages, setExtraPages] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const listFootRef = useRef<HTMLParagraphElement>(null);

  const params = parseClubListParams(searchParams);

  // Below `md` the list runs on, so it holds however many pages the visitor has scrolled past the
  // one in the URL. Desktop never grows it — see the foot of the list — so there this is always
  // the single page `?page=` asks for, and the query is the one the server prefetched.
  const pageNumbers = Array.from({ length: extraPages + 1 }, (_, index) => params.page + index);

  const results = api.useQueries((t) =>
    pageNumbers.map((page) =>
      t.clubs.getAll(toClubsQueryInput({ ...params, page }), {
        // Keep the previous page on screen while the next one loads, so adjusting a filter
        // doesn't flash the grid to empty and jump the page around.
        placeholderData: keepPreviousData,
      })
    )
  );
  const { data: categories } = api.masterData.categories.getAll.useQuery({});

  /** Any change other than paging sends the visitor back to the first page of results. */
  const updateParams = (patch: Partial<ClubListParams>) => {
    const next = { ...params, page: 1, ...patch };
    // A different query is a different list: it starts again at the page the URL now names.
    setExtraPages(0);
    router.push(`${pathname}${buildClubListQuery(next)}`, { scroll: false });
  };

  const toggleCategory = (categoryId: number) => {
    const isSelected = params.categoryIds.includes(categoryId);
    updateParams({
      categoryIds: isSelected
        ? params.categoryIds.filter((id) => id !== categoryId)
        : [...params.categoryIds, categoryId],
    });
  };

  /** Paging leaves the visitor at the foot of the old page, so bring the new one to them. */
  const goToPage = (page: number) => {
    updateParams({ page });
    resultsRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  };

  const loaded = results.map((result) => result.data).filter((page) => page !== undefined);
  const clubs = loaded.flatMap((page) => page.clubs);
  const lastLoaded = loaded.at(-1);
  const total = lastLoaded?.total ?? 0;
  const pageSize = lastLoaded?.pageSize ?? CLUBS_PER_PAGE;
  const totalPages = Math.ceil(total / pageSize);

  const isPending = results[0]?.isPending ?? true;
  const lastPage = params.page + extraPages;
  const hasMore = lastPage < totalPages;
  const isLoadingMore = extraPages > 0 && (results.at(-1)?.isPending ?? false);
  /** Exactly as many skeletons as the incoming page has cards, so nothing shifts when they land. */
  const incomingCount = Math.min(pageSize, total - (lastPage - 1) * pageSize);

  const listFoot = isLoadingMore
    ? "กำลังโหลดชมรมเพิ่ม"
    : extraPages > 0 && !hasMore
      ? `แสดงครบทั้ง ${total} ชมรมแล้ว`
      : "";

  // The foot of the list pulls the next page in as it scrolls into view. It is `md:hidden`, and a
  // `display: none` element never intersects, so a desktop keeps its pagination and its single
  // page without this component ever having to ask how wide the window is.
  useEffect(() => {
    const listFootElement = listFootRef.current;
    if (!listFootElement || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setExtraPages((count) => count + 1);
      },
      // Start the next page while the last cards are still on screen, so the run rarely stalls.
      { rootMargin: "400px" }
    );

    observer.observe(listFootElement);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore]);

  return (
    <div className="flex flex-col gap-8 md:gap-12">
      {/* The search field keeps the header's width; the results below span the full column. It is
          also what the filter panel is anchored to, so the panel lives inside it. */}
      <div className="relative mx-auto w-full max-w-[680px]">
        <ClubSearchBar
          // Remounts the field when the applied term changes elsewhere — a back button, a shared link.
          key={params.search}
          defaultValue={params.search}
          onSearch={(search) => updateParams({ search })}
          onToggleFilters={() => setIsFilterOpen((open) => !open)}
          isFilterOpen={isFilterOpen}
          filterButtonRef={filterButtonRef}
          activeFilterCount={params.categoryIds.length + params.affiliationIds.length}
        />

        <ClubFilterModal
          open={isFilterOpen}
          onOpenChange={setIsFilterOpen}
          triggerRef={filterButtonRef}
          categories={categories ?? []}
          selection={{
            categoryIds: params.categoryIds,
            affiliationIds: params.affiliationIds,
            sort: params.sort,
          }}
          onApply={updateParams}
        />
      </div>

      {/* On mobile the design routes all filtering through the filter modal instead. */}
      <div className="hidden items-start justify-between gap-6 md:flex">
        <CategoryFilterRow
          categories={categories ?? []}
          selectedIds={params.categoryIds}
          onToggle={toggleCategory}
        />
        <ClubSortSelect value={params.sort} onValueChange={(sort) => updateParams({ sort })} />
      </div>

      <div ref={resultsRef} className="flex scroll-mt-6 flex-col gap-8 md:gap-12">
        {isPending ? (
          <ClubGrid>
            {Array.from({ length: CLUBS_PER_PAGE }, (_, index) => (
              <ClubCardSkeleton key={index} />
            ))}
          </ClubGrid>
        ) : clubs.length === 0 ? (
          <EmptyState />
        ) : (
          <ClubGrid>
            {clubs.map((club) => (
              <ClubCard
                key={club.id}
                id={club.id}
                name={club.name}
                logoUrl={club.logoUrl}
                shortDescription={club.shortDescription}
                affiliation={club.affiliation}
                categories={club.categories}
              />
            ))}

            {isLoadingMore &&
              Array.from({ length: incomingCount }, (_, index) => (
                <ClubCardSkeleton key={`incoming-${index}`} />
              ))}
          </ClubGrid>
        )}

        {/* Both the scroll target that pulls the next page in and the only word about what it is
            doing — the skeletons above it are `aria-hidden`, so this is what a screen reader hears. */}
        {clubs.length > 0 && (
          <p
            ref={listFootRef}
            role="status"
            className="font-ibm-plex text-placeholder text-center text-sm leading-[23px] md:hidden"
          >
            {listFoot}
          </p>
        )}

        {/* Kept below the empty state too, so a stale `?page=` deep link has a way back. */}
        <Pagination
          page={params.page}
          totalPages={totalPages}
          onPageChange={goToPage}
          className="hidden md:flex"
        />
      </div>
    </div>
  );
}

function ClubGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">{children}</div>;
}

/** Mirrors the card's own shape so the grid doesn't resize once the real results arrive. */
function ClubCardSkeleton() {
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <SearchX aria-hidden="true" className="text-placeholder size-10" />
      <p className="font-ibm-plex text-foreground text-base leading-[26px] font-semibold md:text-lg md:leading-[30px]">
        ไม่พบชมรมที่ตรงกับเงื่อนไข
      </p>
      <p className="font-ibm-plex text-foreground-muted text-sm leading-[23px] md:text-base md:leading-[26px]">
        ลองใช้คำค้นหาอื่น หรือเอาตัวกรองบางส่วนออก
      </p>
    </div>
  );
}
