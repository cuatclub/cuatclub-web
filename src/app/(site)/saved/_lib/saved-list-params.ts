import type { QueryParamReader } from "@/lib/search-params";

/** Like the activity list, the saved list keeps its state in the URL. These are the keys it owns. */
export const SAVED_LIST_PARAM = {
  search: "q",
  page: "page",
} as const;

/** Two columns × five rows on desktop, the same as the activity list. */
export const SAVED_ACTIVITIES_PER_PAGE = 10;

export type SavedListParams = {
  search: string;
  page: number;
};

const parsePage = (raw: string | null): number => {
  const page = Number(raw);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

export function parseSavedListParams(searchParams: QueryParamReader): SavedListParams {
  return {
    search: searchParams.get(SAVED_LIST_PARAM.search)?.trim() ?? "",
    page: parsePage(searchParams.get(SAVED_LIST_PARAM.page)),
  };
}

/**
 * The exact input both the server prefetch and the client `useQuery` pass to
 * `activities.getSaved`. They must agree field for field, or the query keys differ and the
 * prefetched page is thrown away on hydration.
 */
export function toSavedQueryInput(params: SavedListParams) {
  return {
    search: params.search || undefined,
    page: params.page,
    pageSize: SAVED_ACTIVITIES_PER_PAGE,
  };
}

/** Serializes back to a query string, dropping defaults so an unfiltered list stays at `/saved`. */
export function buildSavedListQuery(params: SavedListParams): string {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set(SAVED_LIST_PARAM.search, params.search);
  if (params.page > 1) searchParams.set(SAVED_LIST_PARAM.page, String(params.page));

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}
