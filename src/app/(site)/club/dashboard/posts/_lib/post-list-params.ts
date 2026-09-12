import type { ActivitySortOption } from "@/server/api/modules/activities/dto";
import type { QueryParamReader } from "@/lib/search-params";

/**
 * "My Posts" keeps its whole state in the URL, so a filtered/sorted view can be shared,
 * bookmarked, and stepped through with the back button. These are the query keys it owns —
 * modelled on `clubs/_lib/club-list-params.ts`.
 */
export const POST_LIST_PARAM = {
  search: "q",
  sort: "sort",
} as const;

export const DEFAULT_SORT: ActivitySortOption = "CREATED_AT_DESC";

export type PostListParams = {
  search: string;
  sort: ActivitySortOption;
};

export function parsePostListParams(searchParams: QueryParamReader): PostListParams {
  return {
    search: searchParams.get(POST_LIST_PARAM.search)?.trim() ?? "",
    sort:
      searchParams.get(POST_LIST_PARAM.sort) === "CREATED_AT_ASC" ? "CREATED_AT_ASC" : DEFAULT_SORT,
  };
}

/**
 * The exact input both the server prefetch and the client `useQuery` pass to `activities.getMine`.
 * They must agree field for field, or the two produce different query keys and the prefetched
 * list is thrown away on hydration.
 */
export function toPostsQueryInput(params: PostListParams) {
  return {
    search: params.search || undefined,
    sort: params.sort,
  };
}

/** Serializes back to a query string, dropping defaults so an unfiltered list stays at `/club/dashboard/posts`. */
export function buildPostListQuery(params: PostListParams): string {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set(POST_LIST_PARAM.search, params.search);
  if (params.sort !== DEFAULT_SORT) searchParams.set(POST_LIST_PARAM.sort, params.sort);

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}
