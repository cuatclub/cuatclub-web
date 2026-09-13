/** Anything that reads query params by name — `URLSearchParams` and Next's `ReadonlyURLSearchParams`. */
export type QueryParamReader = { get: (key: string) => string | null };

/**
 * Next hands a server component its query as a plain record; list-param parsers (e.g.
 * `parseClubListParams`, `parsePostListParams`) want a `QueryParamReader` instead, so both the
 * server prefetch and the client `useSearchParams()` can share the same parsing code.
 */
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
