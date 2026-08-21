"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData } from "@tanstack/react-query";
import { SearchX } from "lucide-react";

import { CategoryFilterRow } from "@/app/clubs/_components/CategoryFilterRow";
import { ClubCard } from "@/app/clubs/_components/ClubCard";
import { ClubSearchBar } from "@/app/clubs/_components/ClubSearchBar";
import { ClubSortSelect } from "@/app/clubs/_components/ClubSortSelect";
import {
  buildClubListQuery,
  CLUBS_PER_PAGE,
  parseClubListParams,
  toClubsQueryInput,
  type ClubListParams,
} from "@/app/clubs/_lib/club-list-params";
import { api } from "@/trpc/react";

/**
 * The interactive half of the club list. Every control writes to the URL and the list reads back
 * from it, so there is one source of truth and a filtered view is always a shareable link.
 */
export function ClubList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = parseClubListParams(searchParams);

  const { data, isPending } = api.clubs.getAll.useQuery(toClubsQueryInput(params), {
    // Keep the previous page on screen while the next one loads, so adjusting a filter
    // doesn't flash the grid to empty and jump the page around.
    placeholderData: keepPreviousData,
  });
  const { data: categories } = api.masterData.categories.getAll.useQuery({});

  /** Any change other than paging sends the visitor back to the first page of results. */
  const updateParams = (patch: Partial<ClubListParams>) => {
    const next = { ...params, page: 1, ...patch };
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

  const clubs = data?.clubs ?? [];

  return (
    <div className="flex flex-col gap-8 md:gap-12">
      {/* The search field keeps the header's width; the results below span the full column. */}
      <div className="mx-auto w-full max-w-[680px]">
        <ClubSearchBar
          // Remounts the field when the applied term changes elsewhere — a back button, a shared link.
          key={params.search}
          defaultValue={params.search}
          onSearch={(search) => updateParams({ search })}
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
        </ClubGrid>
      )}
    </div>
  );
}

function ClubGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3">{children}</div>
  );
}

/** Mirrors the card's own shape so the grid doesn't resize once the real results arrive. */
function ClubCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="border-border flex h-[257px] flex-col gap-4 rounded-xl border bg-white p-5 md:h-[311px] md:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="bg-surface size-14 shrink-0 animate-pulse rounded-full" />
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
