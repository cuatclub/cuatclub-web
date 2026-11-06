import { describe, expect, it } from "vitest";

import { endOfBangkokDay, getBangkokDay, startOfBangkokDay } from "@/lib/date";

// A day as the date picker hands it over: local midnight in whatever timezone the browser uses.
const pickedDay = (year: number, monthIndex: number, day: number) =>
  new Date(year, monthIndex, day);

const toCalendarDay = (date: Date) => [date.getFullYear(), date.getMonth(), date.getDate()];

describe("startOfBangkokDay", () => {
  it("returns 00:00 Bangkok time on the picked day", () => {
    expect(startOfBangkokDay(pickedDay(2026, 9, 27)).toISOString()).toBe(
      "2026-10-26T17:00:00.000Z"
    );
  });
});

describe("endOfBangkokDay", () => {
  it("returns the last millisecond of the picked day in Bangkok", () => {
    expect(endOfBangkokDay(pickedDay(2026, 9, 27)).toISOString()).toBe("2026-10-27T16:59:59.999Z");
  });

  it("rolls over month and year ends", () => {
    expect(endOfBangkokDay(pickedDay(2026, 11, 31)).toISOString()).toBe("2026-12-31T16:59:59.999Z");
  });
});

describe("getBangkokDay", () => {
  it("gives back the picked day for both ends of the window", () => {
    const day = pickedDay(2026, 9, 27);

    expect(toCalendarDay(getBangkokDay(startOfBangkokDay(day)))).toEqual([2026, 9, 27]);
    expect(toCalendarDay(getBangkokDay(endOfBangkokDay(day)))).toEqual([2026, 9, 27]);
  });

  it("shows a deadline saved before the fix (00:00 Bangkok) on that same day", () => {
    expect(toCalendarDay(getBangkokDay(new Date("2026-10-27T00:00:00+07:00")))).toEqual([
      2026, 9, 27,
    ]);
  });

  it("uses the Bangkok day, not the UTC one", () => {
    expect(toCalendarDay(getBangkokDay(new Date("2026-10-26T17:30:00Z")))).toEqual([2026, 9, 27]);
  });
});
