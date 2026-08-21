import { describe, expect, it } from "vitest";

import { getPaginationRange, PAGINATION_ELLIPSIS, type PaginationItem } from "./pagination-range";

const pagesOf = (items: PaginationItem[]) =>
  items.filter((item): item is number => item !== PAGINATION_ELLIPSIS);

describe("getPaginationRange", () => {
  it("lists every page while they still fit", () => {
    expect(getPaginationRange(1, 1)).toEqual([1]);
    expect(getPaginationRange(3, 4)).toEqual([1, 2, 3, 4]);
    expect(getPaginationRange(7, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("has nothing to draw without pages", () => {
    expect(getPaginationRange(1, 0)).toEqual([]);
    expect(getPaginationRange(1, -3)).toEqual([]);
  });

  it("draws the run the design shows", () => {
    expect(getPaginationRange(2, 10)).toEqual([1, 2, 3, PAGINATION_ELLIPSIS, 10]);
  });

  it("keeps one neighbour either side of the current page", () => {
    expect(getPaginationRange(1, 20)).toEqual([1, 2, PAGINATION_ELLIPSIS, 20]);
    expect(getPaginationRange(20, 20)).toEqual([1, PAGINATION_ELLIPSIS, 19, 20]);
    expect(getPaginationRange(10, 20)).toEqual([
      1,
      PAGINATION_ELLIPSIS,
      9,
      10,
      11,
      PAGINATION_ELLIPSIS,
      20,
    ]);
  });

  it("spells out the page an ellipsis would have hidden", () => {
    expect(getPaginationRange(4, 20)).toEqual([1, 2, 3, 4, 5, PAGINATION_ELLIPSIS, 20]);
    expect(getPaginationRange(17, 20)).toEqual([1, PAGINATION_ELLIPSIS, 16, 17, 18, 19, 20]);
  });

  it("keeps both ends and the current page for every position", () => {
    for (let totalPages = 8; totalPages <= 40; totalPages++) {
      for (let page = 1; page <= totalPages; page++) {
        const items = getPaginationRange(page, totalPages);
        const pages = pagesOf(items);

        // Seven slots is as wide as the run ever gets, so it never outgrows a phone.
        expect(items.length).toBeLessThanOrEqual(7);
        expect(pages[0]).toBe(1);
        expect(pages[pages.length - 1]).toBe(totalPages);
        expect(pages).toContain(page);
      }
    }
  });

  it("never hides a single page behind an ellipsis", () => {
    for (let totalPages = 8; totalPages <= 40; totalPages++) {
      for (let page = 1; page <= totalPages; page++) {
        const items = getPaginationRange(page, totalPages);

        items.forEach((item, index) => {
          if (item !== PAGINATION_ELLIPSIS) return;

          const before = items[index - 1];
          const after = items[index + 1];
          if (typeof before !== "number" || typeof after !== "number") {
            throw new Error(`an ellipsis at ${index} is not between two pages`);
          }
          // An "…" standing in for one page would be wider than the page it replaced.
          expect(after - before).toBeGreaterThan(2);
        });
      }
    }
  });

  it("counts up without repeating a page", () => {
    for (let totalPages = 1; totalPages <= 40; totalPages++) {
      for (let page = 1; page <= totalPages; page++) {
        const pages = pagesOf(getPaginationRange(page, totalPages));
        pages.forEach((value, index) => {
          const previous = pages[index - 1];
          if (previous !== undefined) expect(value).toBeGreaterThan(previous);
        });
      }
    }
  });
});
