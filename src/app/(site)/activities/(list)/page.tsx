import { Suspense } from "react";

import { ActivityList, ActivityListShell } from "@/app/(site)/activities/_components";
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
  // in the HTML rather than a grid of skeletons that fill in after hydration — `loading.tsx` only
  // covers the wait, streamed ahead of them in the same response. The client query reuses this
  // exact input, so it hydrates from this data instead of refetching.
  await Promise.all([
    api.activities.getAll.prefetch(toActivitiesQueryInput(params)),
    api.masterData.categories.getAll.prefetch({}),
    api.masterData.activityTypes.getAll.prefetch({}),
    api.masterData.faculties.getAll.prefetch({}),
  ]);

  return (
    <HydrateClient>
      <ActivityListShell>
        {/* useSearchParams needs a boundary so the rest of the page can render without it. */}
        <Suspense>
          <ActivityList />
        </Suspense>
      </ActivityListShell>
    </HydrateClient>
  );
}
