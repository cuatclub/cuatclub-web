import type { ClubSortOption } from "@/server/api/modules/clubs/dto";

/**
 * The club list keeps its whole state in the URL, so a filtered view can be shared, bookmarked,
 * and stepped through with the back button. These are the query keys it owns.
 */
export const CLUB_LIST_PARAM = {
  search: "q",
  categories: "cat",
  affiliations: "aff",
  sort: "sort",
  page: "page",
} as const;

/** Three columns × three rows on desktop. Also the API's own default page size. */
export const CLUBS_PER_PAGE = 9;

export const DEFAULT_SORT: ClubSortOption = "NAME_ASC";

export type ClubListParams = {
  search: string;
  categoryIds: number[];
  affiliationIds: number[];
  sort: ClubSortOption;
  page: number;
};

/** Anything that reads query params by name — `URLSearchParams` and Next's `ReadonlyURLSearchParams`. */
type QueryParamReader = { get: (key: string) => string | null };

/** Ids travel as a comma-separated list (`?cat=1,4`) to keep shared URLs short. */
const parseIds = (raw: string | null): number[] => {
  if (!raw) return [];

  const ids = raw
    .split(",")
    .map((value) => Number(value))
    .filter((id) => Number.isInteger(id) && id > 0);

  return [...new Set(ids)];
};

const parsePage = (raw: string | null): number => {
  const page = Number(raw);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

export function parseClubListParams(searchParams: QueryParamReader): ClubListParams {
  return {
    search: searchParams.get(CLUB_LIST_PARAM.search)?.trim() ?? "",
    categoryIds: parseIds(searchParams.get(CLUB_LIST_PARAM.categories)),
    affiliationIds: parseIds(searchParams.get(CLUB_LIST_PARAM.affiliations)),
    sort: searchParams.get(CLUB_LIST_PARAM.sort) === "NAME_DESC" ? "NAME_DESC" : DEFAULT_SORT,
    page: parsePage(searchParams.get(CLUB_LIST_PARAM.page)),
  };
}

/**
 * The exact input both the server prefetch and the client `useQuery` pass to `clubs.getAll`.
 * They must agree field for field, or the two produce different query keys and the prefetched
 * page is thrown away on hydration.
 */
export function toClubsQueryInput(params: ClubListParams) {
  return {
    search: params.search || undefined,
    categoryIds: params.categoryIds.length > 0 ? params.categoryIds : undefined,
    affiliationIds: params.affiliationIds.length > 0 ? params.affiliationIds : undefined,
    sort: params.sort,
    page: params.page,
    pageSize: CLUBS_PER_PAGE,
  };
}

/** Serializes back to a query string, dropping defaults so an unfiltered list stays at `/clubs`. */
export function buildClubListQuery(params: ClubListParams): string {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set(CLUB_LIST_PARAM.search, params.search);
  if (params.categoryIds.length > 0) {
    searchParams.set(CLUB_LIST_PARAM.categories, params.categoryIds.join(","));
  }
  if (params.affiliationIds.length > 0) {
    searchParams.set(CLUB_LIST_PARAM.affiliations, params.affiliationIds.join(","));
  }
  if (params.sort !== DEFAULT_SORT) searchParams.set(CLUB_LIST_PARAM.sort, params.sort);
  if (params.page > 1) searchParams.set(CLUB_LIST_PARAM.page, String(params.page));

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

/** Next hands a server component its query as a plain record; the parser wants a reader. */
export function toQueryParamReader(
  record: Record<string, string | string[] | undefined>
): URLSearchParams {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(record)) {
    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, item));
    } else if (value !== undefined) {
      searchParams.set(key, value);
    }
  }

  return searchParams;
}
