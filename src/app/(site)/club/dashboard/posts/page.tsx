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

  // Name and avatar come from the session (the clubs table has neither); getSessionOnce() reuses
  // the layout's lookup.
  const session = await getSessionOnce();
  const clubName = session?.user.name ?? "";
  const clubAvatarUrl = session?.user.image ?? "/svg/user_profile.svg";

  // Same input the client query uses, so it hydrates without refetching. The master data is for
  // the edit dialog's form.
  await Promise.all([
    api.activities.getMine.prefetch(toPostsQueryInput(params)),
    api.masterData.activityTypes.getAll.prefetch({}),
    api.masterData.categories.getAll.prefetch({}),
    api.masterData.faculties.getAll.prefetch({}),
  ]);

  return (
    <HydrateClient>
      {/* PostList uses useSearchParams, which needs a Suspense boundary. */}
      <Suspense>
        <PostList clubName={clubName} clubAvatarUrl={clubAvatarUrl} />
      </Suspense>
    </HydrateClient>
  );
}
