/** A gap in the page run, drawn as an inert "…" rather than a page you can click. */
export const PAGINATION_ELLIPSIS = "ellipsis";

export type PaginationItem = number | typeof PAGINATION_ELLIPSIS;

/**
 * How many pages keep the current one company on each side. One either way is what the design
 * draws: page 2 of 10 reads `1 2 3 … 10`.
 */
const SIBLING_COUNT = 1;

/** The widest the run ever gets — first, last, the current page, its two siblings, and two "…". */
const MAX_ITEMS = 2 * SIBLING_COUNT + 5;

const range = (from: number, to: number): number[] =>
  Array.from({ length: to - from + 1 }, (_, index) => from + index);

/**
 * The page run to draw: every page while there are few, otherwise the first and last page with a
 * window around the current one and "…" for the pages that were left out.
 *
 * @example
 * getPaginationRange(1, 4)   // [1, 2, 3, 4]
 * getPaginationRange(2, 10)  // [1, 2, 3, "ellipsis", 10]
 * getPaginationRange(5, 20)  // [1, "ellipsis", 4, 5, 6, "ellipsis", 20]
 */
export function getPaginationRange(page: number, totalPages: number): PaginationItem[] {
  if (totalPages < 1) return [];
  if (totalPages <= MAX_ITEMS) return range(1, totalPages);

  const current = Math.min(Math.max(page, 1), totalPages);
  const siblings = range(
    Math.max(current - SIBLING_COUNT, 1),
    Math.min(current + SIBLING_COUNT, totalPages)
  );
  const shown = [...new Set([1, ...siblings, totalPages])].sort((a, b) => a - b);

  return shown.flatMap((value, index) => {
    const previous = shown[index - 1];
    if (previous === undefined || value - previous === 1) return [value];

    // One skipped page costs the same room as the "…" that would replace it, so draw the page.
    return value - previous === 2 ? [value - 1, value] : [PAGINATION_ELLIPSIS, value];
  });
}
