import { Suspense } from "react";

import { PostList } from "@/app/(site)/club/dashboard/posts/_components";
import { parsePostListParams, toPostsQueryInput } from "@/app/(site)/club/dashboard/posts/_lib";
import { toQueryParamReader } from "@/lib/search-params";
import { getSessionOnce } from "@/server/guard";
import { api, HydrateClient } from "@/trpc/server";

type MyPostsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MyPostsPage({ searchParams }: MyPostsPageProps) {
  const params = parsePostListParams(toQueryParamReader(await searchParams));

  // clubDashboardGuard() already ran in layout.tsx and would redirect a second time if reused
  // here — this only reads the session for the club's own name/avatar (session.user is this
  // account's identity; the clubs table itself carries neither field). getSessionOnce() is
  // cache()-memoized, so this reuses the layout's lookup instead of querying again.
  const session = await getSessionOnce();
  const clubName = session?.user.name ?? "";
  const clubAvatarUrl = session?.user.image ?? "/svg/user_profile.svg";

  // Awaited, not fire-and-forget: the list should arrive with its results already in the HTML.
  // The client query below reuses this exact input, so it hydrates instead of refetching — and
  // the master-data lists are prefetched too because the details dialog's form needs all three
  // to render, without a second round trip once it opens.
  await Promise.all([
    api.activities.getMine.prefetch(toPostsQueryInput(params)),
    api.masterData.activityTypes.getAll.prefetch({}),
    api.masterData.categories.getAll.prefetch({}),
    api.masterData.faculties.getAll.prefetch({}),
  ]);

  return (
    <HydrateClient>
      {/* useSearchParams needs a boundary so the rest of the page can render without it. The
          greeting lives inside `PostList`'s left column, not here — Figma's rail top-aligns
          with the greeting, which only works once both are cells of the same two-column row. */}
      <Suspense>
        <PostList clubName={clubName} clubAvatarUrl={clubAvatarUrl} />
      </Suspense>
    </HydrateClient>
  );
}
