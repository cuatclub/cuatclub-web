import { Suspense } from "react";
import type { Metadata } from "next";

import { ClubList } from "@/app/clubs/_components";
import { parseClubListParams, toClubsQueryInput, toQueryParamReader } from "@/app/clubs/_lib";
import { api, HydrateClient } from "@/trpc/server";

export const metadata: Metadata = {
  title: "ชมรมทั้งหมด",
  description: "ค้นหาและเลือกดูชมรมทั้งหมดในจุฬาลงกรณ์มหาวิทยาลัย ตามหมวดหมู่ สังกัด หรือชื่อชมรม",
};

type ClubListPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ClubListPage({ searchParams }: ClubListPageProps) {
  const params = parseClubListParams(toQueryParamReader(await searchParams));

  // Awaited, not fire-and-forget: a shared or crawled link should arrive with its results already
  // in the HTML rather than a grid of skeletons that fill in after hydration. The client query
  // reuses this exact input, so it hydrates from this data instead of refetching.
  await Promise.all([
    api.clubs.getAll.prefetch(toClubsQueryInput(params)),
    api.masterData.categories.getAll.prefetch({}),
  ]);

  return (
    <HydrateClient>
      <main className="mx-auto flex w-full max-w-[1512px] flex-col gap-6 px-5 py-2.5 md:gap-8 md:px-8 md:py-10 xl:px-25">
        <header className="mx-auto flex w-full max-w-[680px] flex-col gap-1 text-center">
          <h1 className="font-ibm-plex text-foreground text-primary text-[32px] leading-[53px] font-semibold md:text-5xl md:leading-[79px]">
            ชมรมทั้งหมด
          </h1>
          <p className="font-ibm-plex text-foreground-muted text-base leading-[26px] md:text-xl md:leading-[33px]">
            รวมกว่า 300+ ชมรมจากทุกมุมของจุฬาฯ ไว้ในที่เดียว
          </p>
        </header>

        {/* Results sit 32px inside the header on desktop, per the Figma frame. */}
        <div className="md:px-8">
          {/* useSearchParams needs a boundary so the rest of the page can render without it. */}
          <Suspense>
            <ClubList />
          </Suspense>
        </div>
      </main>
    </HydrateClient>
  );
}
