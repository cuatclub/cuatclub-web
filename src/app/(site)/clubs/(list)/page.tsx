import { Suspense } from "react";

import { ClubList, ClubListShell } from "@/app/(site)/clubs/_components";
import { parseClubListParams, toClubsQueryInput } from "@/app/(site)/clubs/_lib";
import { toQueryParamReader } from "@/lib/search-params";
import { api, HydrateClient } from "@/trpc/server";

type ClubListPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ClubListPage({ searchParams }: ClubListPageProps) {
  const params = parseClubListParams(toQueryParamReader(await searchParams));

  // Awaited, not fire-and-forget: a shared or crawled link should arrive with its results already
  // in the HTML rather than a grid of skeletons that fill in after hydration — `loading.tsx` only
  // covers the wait, streamed ahead of them in the same response. The client query reuses this
  // exact input, so it hydrates from this data instead of refetching.
  await Promise.all([
    api.clubs.getAll.prefetch(toClubsQueryInput(params)),
    api.masterData.categories.getAll.prefetch({}),
  ]);

  return (
    <HydrateClient>
      <ClubListShell>
        {/* useSearchParams needs a boundary so the rest of the page can render without it. */}
        <Suspense>
          <ClubList />
        </Suspense>
      </ClubListShell>
    </HydrateClient>
  );
}
