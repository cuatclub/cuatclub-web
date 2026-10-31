import { Suspense } from "react";
import type { Metadata } from "next";

import { SavedList, SavedShell } from "@/app/(site)/saved/_components";
import { parseSavedListParams, toSavedQueryInput } from "@/app/(site)/saved/_lib";
import { toQueryParamReader } from "@/lib/search-params";
import { signedInGuard } from "@/server/guard";
import { api, HydrateClient } from "@/trpc/server";

export const metadata: Metadata = {
  title: "ที่บันทึกไว้",
};

type SavedPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SavedPage({ searchParams }: SavedPageProps) {
  await signedInGuard();

  const params = parseSavedListParams(toQueryParamReader(await searchParams));

  // Awaited, not fire-and-forget, so a refresh arrives with the saved cards already in the HTML.
  // The client queries reuse these exact inputs, so they hydrate from this data. The ids are what
  // every card's bookmark reads.
  await Promise.all([
    api.activities.getSaved.prefetch(toSavedQueryInput(params)),
    api.activities.getSavedIds.prefetch({}),
  ]);

  return (
    <HydrateClient>
      <SavedShell>
        {/* useSearchParams needs a boundary so the rest of the page can render without it. */}
        <Suspense>
          <SavedList />
        </Suspense>
      </SavedShell>
    </HydrateClient>
  );
}
