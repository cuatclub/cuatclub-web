export const THAI_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
] as const;

export const THAI_MONTHS_LONG = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
] as const;

// Sunday-first, matching a standard month grid.
export const THAI_WEEKDAYS_SHORT = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"] as const;

const BUDDHIST_YEAR_OFFSET = 543;

export function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isBetween(day: Date, start: Date, end: Date): boolean {
  const time = startOfDay(day).getTime();
  return time > startOfDay(start).getTime() && time < startOfDay(end).getTime();
}

/** ISO calendar date (`YYYY-MM-DD`) at the local day boundary. */
export function toISODate(date: Date): string {
  return startOfDay(date).toISOString().slice(0, 10);
}

/** e.g. `new Date(2026, 8, 6)` -> "6 ก.ย. 2569" */
export function toBuddhistDisplay(date: Date): string {
  return `${date.getDate()} ${THAI_MONTHS_SHORT[date.getMonth()]} ${
    date.getFullYear() + BUDDHIST_YEAR_OFFSET
  }`;
}

/** Same as `toBuddhistDisplay` but without the year, e.g. "6 ก.ย." — for a same-context date range. */
export function toShortDisplay(date: Date): string {
  return `${date.getDate()} ${THAI_MONTHS_SHORT[date.getMonth()]}`;
}

/** e.g. viewYear 2026, viewMonth 8 -> "กันยายน 2569" */
export function toBuddhistMonthLabel(viewYear: number, viewMonth: number): string {
  return `${THAI_MONTHS_LONG[viewMonth]} ${viewYear + BUDDHIST_YEAR_OFFSET}`;
}

/**
 * A fixed 6-row (42-cell) grid for the given month, filled with the days from
 * the adjacent months so every cell is a real Date. `isCurrentMonth` lets the
 * caller dim the overflow days.
 */
export function buildMonthGrid(
  viewYear: number,
  viewMonth: number
): { date: Date; isCurrentMonth: boolean }[] {
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const gridStart = new Date(viewYear, viewMonth, 1 - firstOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + index
    );
    return { date, isCurrentMonth: date.getMonth() === viewMonth };
  });
}
