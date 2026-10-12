"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchX, Users } from "lucide-react";

import { CategoryFilterRow } from "@/app/(site)/clubs/_components/CategoryFilterRow";
import { ClubCard } from "@/app/(site)/clubs/_components/ClubCard";
import { ClubCardSkeleton } from "@/app/(site)/clubs/_components/ClubCardSkeleton";
import { ClubFilterModal } from "@/app/(site)/clubs/_components/ClubFilterModal";
import { ClubGrid } from "@/app/(site)/clubs/_components/ClubGrid";
import { ClubSearchBar } from "@/app/(site)/clubs/_components/ClubSearchBar";
import { ClubSortSelect } from "@/app/(site)/clubs/_components/ClubSortSelect";
import {
  buildClubListQuery,
  CLUBS_PER_PAGE,
  parseClubListParams,
  toClubsQueryInput,
  type ClubListParams,
} from "@/app/(site)/clubs/_lib/club-list-params";
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
  const [isNavigating, startTransition] = useTransition();
  const resultsRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const listFootRef = useRef<HTMLParagraphElement>(null);

  const params = parseClubListParams(searchParams);
  const query = buildClubListQuery(params);

  // A different query is a different list: it starts again at the page the URL now names. Keyed
  // off the URL itself rather than off the controls, because the back button changes it without
  // going through them — a restored view would otherwise still hold the pages that were scrolled
  // past in the list it left behind.
  const [listQuery, setListQuery] = useState(query);
  if (listQuery !== query) {
    setListQuery(query);
    setExtraPages(0);
  }

  // Below `md` the list runs on, so it holds however many pages the visitor has scrolled past the
  // one in the URL. Desktop never grows it — see the foot of the list — so there this is always
  // the single page `?page=` asks for, and the query is the one the server prefetched.
  const pageNumbers = Array.from({ length: extraPages + 1 }, (_, index) => params.page + index);

  const results = api.useQueries((t) =>
    pageNumbers.map((page) => t.clubs.getAll(toClubsQueryInput({ ...params, page })))
  );
  const { data: categories } = api.masterData.categories.getAll.useQuery({});

  /** Any change other than paging sends the visitor back to the first page of results. */
  const updateParams = (patch: Partial<ClubListParams>) => {
    const next = { ...params, page: 1, ...patch };
    // The page prefetches the new results on the server and they land together with the new URL,
    // so the query never pends on its own. The transition does, until the navigation finishes —
    // that is what puts the skeletons up in the meantime.
    startTransition(() => {
      router.push(`${pathname}${buildClubListQuery(next)}`, { scroll: false });
    });
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
  /** The whole list is being replaced: a first load, or a new query on its way. */
  const isLoadingResults = isPending || isNavigating;
  const lastPage = params.page + extraPages;
  const hasMore = lastPage < totalPages;
  const isLoadingMore = extraPages > 0 && (results.at(-1)?.isPending ?? false);
  /** Exactly as many skeletons as the incoming page has cards, so nothing shifts when they land. */
  const incomingCount = Math.max(0, Math.min(pageSize, total - (lastPage - 1) * pageSize));

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
          also what the filter panel is anchored to, so the panel lives inside it — but only from
          `md` up, where that panel turns into a card dropping out of this box. Staying static on a
          phone keeps the bar out of the paint layer it would otherwise share with the header's
          slide-out menu, which sits earlier in the document and would lose to it. */}
      <div className="mx-auto w-full max-w-[680px] md:relative">
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

      {/* The skeletons are `aria-hidden`, so `aria-busy` is what tells assistive tech the results
          are being replaced. */}
      <div
        ref={resultsRef}
        aria-busy={isLoadingResults}
        className="flex scroll-mt-6 flex-col gap-8 md:gap-12"
      >
        {isLoadingResults ? (
          <ClubGrid>
            {Array.from({ length: CLUBS_PER_PAGE }, (_, index) => (
              <ClubCardSkeleton key={index} />
            ))}
          </ClubGrid>
        ) : clubs.length === 0 ? (
          <EmptyState
            hasActiveQuery={
              params.search.length > 0 ||
              params.categoryIds.length > 0 ||
              params.affiliationIds.length > 0
            }
          />
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

function EmptyState({ hasActiveQuery }: { hasActiveQuery: boolean }) {
  // A search/filter that matches nothing is a different situation from there being no clubs at
  // all yet — the former suggests loosening the query, the latter has nothing to suggest.
  const Icon = hasActiveQuery ? SearchX : Users;

  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <Icon aria-hidden="true" className="text-placeholder size-10" />
      <p className="font-ibm-plex text-foreground text-base leading-[26px] font-semibold md:text-lg md:leading-[30px]">
        {hasActiveQuery ? "ไม่พบชมรมที่ตรงกับเงื่อนไข" : "ยังไม่มีชมรมในขณะนี้"}
      </p>
      <p className="font-ibm-plex text-foreground-muted text-sm leading-[23px] md:text-base md:leading-[26px]">
        {hasActiveQuery
          ? "ลองใช้คำค้นหาอื่น หรือเอาตัวกรองบางส่วนออก"
          : "กลับมาดูใหม่เร็ว ๆ นี้ ชมรมต่าง ๆ จะแสดงที่นี่"}
      </p>
    </div>
  );
}
