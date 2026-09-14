"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData } from "@tanstack/react-query";
import { SearchX } from "lucide-react";

import { ActivityCard } from "@/app/(site)/activities/_components/ActivityCard";
import { ActivityFilterModal } from "@/app/(site)/activities/_components/ActivityFilterModal";
import { ActivitySearchBar } from "@/app/(site)/activities/_components/ActivitySearchBar";
import { ActivitySortSelect } from "@/app/(site)/activities/_components/ActivitySortSelect";
import { CategoryFilterRow } from "@/app/(site)/activities/_components/CategoryFilterRow";
import {
  ACTIVITIES_PER_PAGE,
  buildActivityListQuery,
  parseActivityListParams,
  toActivitiesQueryInput,
  type ActivityListParams,
} from "@/app/(site)/activities/_lib/activity-list-params";
import { Pagination } from "@/components/ui/Pagination";
import { api } from "@/trpc/react";

/**
 * The interactive half of the activity list. Every control writes to the URL and the list reads
 * back from it, so there is one source of truth and a filtered view is always a shareable link.
 */
export function ActivityList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [extraPages, setExtraPages] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const listFootRef = useRef<HTMLParagraphElement>(null);

  const params = parseActivityListParams(searchParams);
  const query = buildActivityListQuery(params);

  const [listQuery, setListQuery] = useState(query);
  if (listQuery !== query) {
    setListQuery(query);
    setExtraPages(0);
  }

  const pageNumbers = Array.from({ length: extraPages + 1 }, (_, index) => params.page + index);

  const results = api.useQueries((t) =>
    pageNumbers.map((page) =>
      t.activities.getAll(toActivitiesQueryInput({ ...params, page }), {
        placeholderData: keepPreviousData,
      })
    )
  );
  const { data: categories } = api.masterData.categories.getAll.useQuery({});

  /** Any change other than paging sends the visitor back to the first page of results. */
  const updateParams = (patch: Partial<ActivityListParams>) => {
    const next = { ...params, page: 1, ...patch };
    router.push(`${pathname}${buildActivityListQuery(next)}`, { scroll: false });
  };

  const toggleCategory = (categoryId: number) => {
    const isSelected = params.categoryIds.includes(categoryId);
    updateParams({
      categoryIds: isSelected
        ? params.categoryIds.filter((id) => id !== categoryId)
        : [...params.categoryIds, categoryId],
    });
  };

  const goToPage = (page: number) => {
    updateParams({ page });
    resultsRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  };

  const loaded = results.map((result) => result.data).filter((page) => page !== undefined);
  const activities = loaded.flatMap((page) => page.activities);
  const lastLoaded = loaded.at(-1);
  const total = lastLoaded?.total ?? 0;
  const pageSize = lastLoaded?.pageSize ?? ACTIVITIES_PER_PAGE;
  const totalPages = Math.ceil(total / pageSize);

  const isPending = results[0]?.isPending ?? true;
  const lastPage = params.page + extraPages;
  const hasMore = lastPage < totalPages;
  const isLoadingMore = extraPages > 0 && (results.at(-1)?.isPending ?? false);
  const incomingCount = Math.max(0, Math.min(pageSize, total - (lastPage - 1) * pageSize));

  const activeFilterCount =
    params.categoryIds.length +
    params.activityTypeIds.length +
    params.facultyIds.length +
    params.yearLevels.length +
    (params.audience ? 1 : 0);

  const listFoot = isLoadingMore
    ? "กำลังโหลดกิจกรรมเพิ่ม"
    : extraPages > 0 && !hasMore
      ? `แสดงครบทั้ง ${total} กิจกรรมแล้ว`
      : "";

  useEffect(() => {
    const listFootElement = listFootRef.current;
    if (!listFootElement || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setExtraPages((count) => count + 1);
      },
      { rootMargin: "400px" }
    );

    observer.observe(listFootElement);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore]);

  // A `?page=` past the last real page (e.g. a filter applied while further along than it now
  // has room for) would otherwise render the empty state even though matches exist — clamp back
  // to the last page instead. Genuinely zero results (`total === 0`) are left to the empty state.
  useEffect(() => {
    if (isPending || total === 0 || params.page <= totalPages) return;

    router.replace(`${pathname}${buildActivityListQuery({ ...params, page: totalPages })}`, {
      scroll: false,
    });
  }, [isPending, total, totalPages, params, pathname, router]);

  return (
    <div className="flex flex-col gap-8 md:gap-12">
      <div className="mx-auto w-full max-w-[680px] md:relative">
        <ActivitySearchBar
          key={params.search}
          defaultValue={params.search}
          onSearch={(search) => updateParams({ search })}
          onToggleFilters={() => setIsFilterOpen((open) => !open)}
          isFilterOpen={isFilterOpen}
          filterButtonRef={filterButtonRef}
          activeFilterCount={activeFilterCount}
        />

        <ActivityFilterModal
          open={isFilterOpen}
          onOpenChange={setIsFilterOpen}
          triggerRef={filterButtonRef}
          categories={categories ?? []}
          selection={{
            categoryIds: params.categoryIds,
            activityTypeIds: params.activityTypeIds,
            facultyIds: params.facultyIds,
            audience: params.audience,
            yearLevels: params.yearLevels,
            sort: params.sort,
          }}
          onApply={updateParams}
        />
      </div>

      <div className="hidden items-start justify-between gap-6 md:flex">
        <CategoryFilterRow
          categories={categories ?? []}
          selectedIds={params.categoryIds}
          onToggle={toggleCategory}
        />
        <ActivitySortSelect value={params.sort} onValueChange={(sort) => updateParams({ sort })} />
      </div>

      <div ref={resultsRef} className="flex scroll-mt-6 flex-col gap-8 md:gap-12">
        {isPending ? (
          <ActivityGrid>
            {Array.from({ length: ACTIVITIES_PER_PAGE }, (_, index) => (
              <ActivityCardSkeleton key={index} />
            ))}
          </ActivityGrid>
        ) : activities.length === 0 ? (
          <EmptyState hasActiveQuery={activeFilterCount > 0 || params.search.length > 0} />
        ) : (
          <ActivityGrid>
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                title={activity.title}
                description={activity.description}
                posterUrl={activity.posterUrl}
                club={activity.club}
                categories={activity.categories}
                faculties={activity.faculties}
                yearLevels={activity.yearLevels}
                audience={activity.audience}
                applicationStartAt={activity.applicationStartAt}
                applicationEndAt={activity.applicationEndAt}
                isApplicationOpen={activity.isApplicationOpen}
              />
            ))}

            {isLoadingMore &&
              Array.from({ length: incomingCount }, (_, index) => (
                <ActivityCardSkeleton key={`incoming-${index}`} />
              ))}
          </ActivityGrid>
        )}

        {activities.length > 0 && (
          <p
            ref={listFootRef}
            role="status"
            className="font-ibm-plex text-placeholder text-center text-sm leading-[23px] md:hidden"
          >
            {listFoot}
          </p>
        )}

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

function ActivityGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">{children}</div>;
}

/** Mirrors the card's own shape so the grid doesn't resize once the real results arrive. */
function ActivityCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="border-border flex flex-col gap-4 rounded-xl border bg-white p-4 md:h-[294px] md:flex-row md:gap-5"
    >
      <div className="bg-surface h-[180px] w-full shrink-0 animate-pulse rounded-xl md:h-full md:w-[205px]" />
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-surface size-8 shrink-0 animate-pulse rounded-full" />
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

function EmptyState({ hasActiveQuery }: { hasActiveQuery: boolean }) {
  // A search/filter that matches nothing is a different situation from there being no activities
  // at all yet — the former suggests loosening the query, the latter has nothing to say.
  if (!hasActiveQuery) return <div className="py-16" />;

  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <SearchX aria-hidden="true" className="text-placeholder size-10" />
      <p className="font-ibm-plex text-foreground text-base leading-[26px] font-semibold md:text-lg md:leading-[30px]">
        ไม่พบกิจกรรมที่ตรงกับเงื่อนไข
      </p>
      <p className="font-ibm-plex text-foreground-muted text-sm leading-[23px] md:text-base md:leading-[26px]">
        ลองใช้คำค้นหาอื่น หรือเอาตัวกรองบางส่วนออก
      </p>
    </div>
  );
}
