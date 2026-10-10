import type { ActivityOutputDTO } from "@/server/api/modules/activities/dto";
import type { FacultyOutputDTO } from "@/server/api/modules/master-data/dto";
import { THAI_MONTHS_SHORT } from "@/lib/date";

export const AUDIENCE_LABEL: Record<ActivityOutputDTO["audience"], string> = {
  CHULA_STUDENT: "นิสิตจุฬาฯ",
  GENERAL_PUBLIC: "บุคคลทั่วไป",
};

const TOTAL_YEAR_LEVELS = 4;

/** Consecutive years collapse to a range ("ปี 1-3"); gaps stay listed ("ปี 1, 3"). */
export const formatYearLevels = (yearLevels: number[]): string => {
  const sorted = [...new Set(yearLevels)].sort((a, b) => a - b);
  if (sorted.length === 0 || sorted.length === TOTAL_YEAR_LEVELS) return "ทุกชั้นปี";

  const runs: { start: number; end: number }[] = [];
  for (const level of sorted) {
    const lastRun = runs[runs.length - 1];
    if (lastRun?.end === level - 1) lastRun.end = level;
    else runs.push({ start: level, end: level });
  }

  const parts = runs.map(({ start, end }) => (start === end ? `${start}` : `${start}-${end}`));
  return `ปี ${parts.join(", ")}`;
};

export const formatFaculties = (faculties: FacultyOutputDTO[]): string => {
  const [first] = faculties;
  if (!first) return "ไม่จำกัดคณะ";
  return faculties.length === 1 ? first.label : `${first.label} และอื่นๆ`;
};

/** The app's one domain timezone — the server (often UTC) and a visitor's browser otherwise
 *  disagree on which day an `applicationStartAt`/`applicationEndAt` falls on, which would
 *  desync the server-rendered HTML from the client's hydration render. */
const ACTIVITY_TIME_ZONE = "Asia/Bangkok";

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: ACTIVITY_TIME_ZONE,
  day: "numeric",
  month: "numeric",
});

/** e.g. "6 ก.ย." */
export const formatShortDate = (date: Date): string => {
  const parts = shortDateFormatter.formatToParts(date);
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const month = Number(parts.find((part) => part.type === "month")?.value ?? 1) - 1;
  return `${day} ${THAI_MONTHS_SHORT[month]}`;
};
