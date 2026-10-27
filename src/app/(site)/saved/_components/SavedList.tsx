"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData } from "@tanstack/react-query";

import {
  ActivityCard,
  ActivityCardSkeleton,
  ActivityGrid,
} from "@/app/(site)/activities/_components";
import {
  NoSavedActivities,
  NoSavedSearchResults,
} from "@/app/(site)/saved/_components/SavedEmptyState";
import {
  SAVED_ACTIVITIES_PER_PAGE,
  buildSavedListQuery,
  parseSavedListParams,
  toSavedQueryInput,
  type SavedListParams,
} from "@/app/(site)/saved/_lib";
import { Pagination } from "@/components/ui";
import { PostSearchBar } from "@/features/activities/search/PostSearchBar";
import { api } from "@/trpc/react";

/**
 * The interactive half of the saved list. Search and page live in the URL and the list reads back
 * from it, so a search is a shareable link and the back button steps through it.
 */
export function SavedList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const resultsRef = useRef<HTMLDivElement>(null);

  const params = parseSavedListParams(searchParams);

  const { data, isPending, isError, isPlaceholderData } = api.activities.getSaved.useQuery(
    toSavedQueryInput(params),
    { placeholderData: keepPreviousData }
  );

  const updateParams = (patch: Partial<SavedListParams>, { replace = false } = {}) => {
    const url = `${pathname}${buildSavedListQuery({ ...params, ...patch })}`;
    if (replace) router.replace(url, { scroll: false });
    else router.push(url, { scroll: false });
  };

  const goToPage = (page: number) => {
    updateParams({ page });
    resultsRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  };

  const activities = data?.activities ?? [];
  const total = data?.total ?? 0;
  const pageSize = data?.pageSize ?? SAVED_ACTIVITIES_PER_PAGE;
  const totalPages = Math.ceil(total / pageSize);
  /** Past the last page of a list that has results — e.g. after unsaving the last card on it. */
  const isPageOutOfRange = !isPlaceholderData && total > 0 && params.page > totalPages;

  // Unsaving the only card on the last page leaves that page empty although earlier ones still
  // have cards — step back to the last real page instead of showing an empty state.
  useEffect(() => {
    if (!isPageOutOfRange) return;

    router.replace(`${pathname}${buildSavedListQuery({ ...params, page: totalPages })}`, {
      scroll: false,
    });
  }, [isPageOutOfRange, totalPages, params, pathname, router]);

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <PostSearchBar
        defaultValue={params.search}
        onSearch={(search) => updateParams({ search, page: 1 }, { replace: true })}
        className="md:max-w-[480px]"
      />

      {/* The skeletons are `aria-hidden`, so `aria-busy` is what tells assistive tech the results
          are being replaced. */}
      <div
        ref={resultsRef}
        aria-busy={isPending || isPlaceholderData || isPageOutOfRange}
        className="flex scroll-mt-6 flex-col gap-8 md:gap-12"
      >
        {isPending || isPageOutOfRange ? (
          <ActivityGrid>
            {Array.from({ length: SAVED_ACTIVITIES_PER_PAGE }, (_, index) => (
              <ActivityCardSkeleton key={index} />
            ))}
          </ActivityGrid>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="font-ibm-plex text-foreground text-base leading-[26px] font-semibold md:text-lg md:leading-[30px]">
              โหลดโพสต์ที่บันทึกไว้ไม่สำเร็จ
            </p>
            <p className="font-ibm-plex text-foreground-muted text-sm leading-[23px] md:text-base md:leading-[26px]">
              กรุณาลองใหม่อีกครั้ง
            </p>
          </div>
        ) : activities.length === 0 ? (
          params.search ? (
            <NoSavedSearchResults />
          ) : (
            <NoSavedActivities />
          )
        ) : (
          <ActivityGrid>
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                id={activity.id}
                title={activity.title}
                description={activity.description}
                posterUrl={activity.posterUrl}
                club={activity.club}
                categories={activity.categories}
                faculties={activity.faculties}
                yearLevels={activity.yearLevels}
                audience={activity.audience}
                activityType={activity.activityType}
                applicationStartAt={activity.applicationStartAt}
                applicationEndAt={activity.applicationEndAt}
                isApplicationClosed={activity.isApplicationClosed}
              />
            ))}
          </ActivityGrid>
        )}

        <Pagination page={params.page} totalPages={totalPages} onPageChange={goToPage} />
      </div>
    </div>
  );
}
