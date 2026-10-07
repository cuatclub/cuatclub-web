import type { ActivitySortOption } from "@/server/api/modules/activities/dto";

/**
 * The activity list keeps its whole state in the URL, so a filtered view can be shared,
 * bookmarked, and stepped through with the back button. These are the query keys it owns.
 */
export const ACTIVITY_LIST_PARAM = {
  search: "q",
  categories: "cat",
  activityTypes: "type",
  faculties: "fac",
  audience: "aud",
  yearLevels: "yr",
  sort: "sort",
  page: "page",
} as const;

/** Two columns × five rows on desktop. Also the API's own default page size. */
export const ACTIVITIES_PER_PAGE = 10;

export const DEFAULT_SORT: ActivitySortOption = "CREATED_AT_DESC";

const AUDIENCE_VALUES = ["CHULA_STUDENT", "GENERAL_PUBLIC"] as const;
type AudienceValue = (typeof AUDIENCE_VALUES)[number];

export type ActivityListParams = {
  search: string;
  categoryIds: number[];
  activityTypeIds: number[];
  facultyIds: number[];
  audience: AudienceValue | undefined;
  yearLevels: number[];
  sort: ActivitySortOption;
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

/** Year levels are ids too, but bounded to 1-4 — anything outside that range isn't a real level. */
const parseYearLevels = (raw: string | null): number[] =>
  parseIds(raw).filter((level) => level >= 1 && level <= 4);

const parseAudience = (raw: string | null): AudienceValue | undefined =>
  AUDIENCE_VALUES.includes(raw as AudienceValue) ? (raw as AudienceValue) : undefined;

const parsePage = (raw: string | null): number => {
  const page = Number(raw);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

export function parseActivityListParams(searchParams: QueryParamReader): ActivityListParams {
  return {
    search: searchParams.get(ACTIVITY_LIST_PARAM.search)?.trim() ?? "",
    categoryIds: parseIds(searchParams.get(ACTIVITY_LIST_PARAM.categories)),
    activityTypeIds: parseIds(searchParams.get(ACTIVITY_LIST_PARAM.activityTypes)),
    facultyIds: parseIds(searchParams.get(ACTIVITY_LIST_PARAM.faculties)),
    audience: parseAudience(searchParams.get(ACTIVITY_LIST_PARAM.audience)),
    yearLevels: parseYearLevels(searchParams.get(ACTIVITY_LIST_PARAM.yearLevels)),
    sort:
      searchParams.get(ACTIVITY_LIST_PARAM.sort) === "CREATED_AT_ASC"
        ? "CREATED_AT_ASC"
        : DEFAULT_SORT,
    page: parsePage(searchParams.get(ACTIVITY_LIST_PARAM.page)),
  };
}

/**
 * The exact input both the server prefetch and the client `useQuery` pass to `activities.getAll`.
 * They must agree field for field, or the two produce different query keys and the prefetched
 * page is thrown away on hydration.
 */
export function toActivitiesQueryInput(params: ActivityListParams) {
  return {
    search: params.search || undefined,
    categoryIds: params.categoryIds.length > 0 ? params.categoryIds : undefined,
    activityTypeIds: params.activityTypeIds.length > 0 ? params.activityTypeIds : undefined,
    facultyIds: params.facultyIds.length > 0 ? params.facultyIds : undefined,
    audience: params.audience,
    yearLevels: params.yearLevels.length > 0 ? params.yearLevels : undefined,
    sort: params.sort,
    page: params.page,
    pageSize: ACTIVITIES_PER_PAGE,
  };
}

/** Serializes back to a query string, dropping defaults so an unfiltered list stays at `/activities`. */
export function buildActivityListQuery(params: ActivityListParams): string {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set(ACTIVITY_LIST_PARAM.search, params.search);
  if (params.categoryIds.length > 0) {
    searchParams.set(ACTIVITY_LIST_PARAM.categories, params.categoryIds.join(","));
  }
  if (params.activityTypeIds.length > 0) {
    searchParams.set(ACTIVITY_LIST_PARAM.activityTypes, params.activityTypeIds.join(","));
  }
  if (params.facultyIds.length > 0) {
    searchParams.set(ACTIVITY_LIST_PARAM.faculties, params.facultyIds.join(","));
  }
  if (params.audience) searchParams.set(ACTIVITY_LIST_PARAM.audience, params.audience);
  if (params.yearLevels.length > 0) {
    searchParams.set(ACTIVITY_LIST_PARAM.yearLevels, params.yearLevels.join(","));
  }
  if (params.sort !== DEFAULT_SORT) searchParams.set(ACTIVITY_LIST_PARAM.sort, params.sort);
  if (params.page > 1) searchParams.set(ACTIVITY_LIST_PARAM.page, String(params.page));

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
