import { Suspense } from "react";

import { ActivityList } from "@/app/(site)/activities/_components";
import {
  parseActivityListParams,
  toActivitiesQueryInput,
  toQueryParamReader,
} from "@/app/(site)/activities/_lib";
import { api, HydrateClient } from "@/trpc/server";

type ActivityListPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ActivityListPage({ searchParams }: ActivityListPageProps) {
  const params = parseActivityListParams(toQueryParamReader(await searchParams));

  // Awaited, not fire-and-forget: a shared or crawled link should arrive with its results already
  // in the HTML rather than a grid of skeletons that fill in after hydration. The client query
  // reuses this exact input, so it hydrates from this data instead of refetching.
  await Promise.all([
    api.activities.getAll.prefetch(toActivitiesQueryInput(params)),
    api.masterData.categories.getAll.prefetch({}),
    api.masterData.activityTypes.getAll.prefetch({}),
    api.masterData.faculties.getAll.prefetch({}),
  ]);

  return (
    <HydrateClient>
      <main className="mx-auto flex w-full max-w-[1512px] flex-col gap-6 px-5 pt-5 pb-8 md:gap-8 md:px-8 md:pt-10 md:pb-16 xl:px-25">
        <header className="mx-auto flex w-full max-w-[680px] flex-col gap-1 text-center">
          <h1 className="font-ibm-plex text-primary text-[32px] leading-[53px] font-semibold md:text-5xl md:leading-[79px]">
            กิจกรรมทั้งหมด
          </h1>
          <p className="font-ibm-plex text-foreground-muted text-base leading-[26px] md:text-xl md:leading-[33px]">
            ทุกกิจกรรม ทุกการแข่งขัน ทุกโอกาสจากหลากหลายชมรมจุฬาฯ ในที่เดียว
          </p>
        </header>

        <div className="md:px-8">
          {/* useSearchParams needs a boundary so the rest of the page can render without it. */}
          <Suspense>
            <ActivityList />
          </Suspense>
        </div>
      </main>
    </HydrateClient>
  );
}
