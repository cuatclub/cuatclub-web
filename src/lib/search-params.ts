/** Anything that reads query params by name — `URLSearchParams` and Next's `ReadonlyURLSearchParams`. */
export type QueryParamReader = { get: (key: string) => string | null };

/**
 * Adapts Next's searchParams record to a `QueryParamReader`, so server and client
 * share parsers.
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
