import type { ApplicationDeadlineEvent } from "@/features/activities/calendar/application-deadline-event";

const LINE_BREAK = "\r\n";

/** RFC 5545 caps a content line at 75 octets, not characters. */
const MAX_LINE_OCTETS = 75;

const encoder = new TextEncoder();

/** `\`, `;`, `,` and line breaks mean something inside an iCalendar text value. */
const escapeText = (text: string): string =>
  text
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");

/**
 * Splits a long line into physical lines no longer than 75 octets, each continuation starting
 * with a space. Thai characters are three octets in UTF-8, so the cut is made on whole
 * characters — a split inside one would corrupt it.
 */
const foldLine = (line: string): string[] => {
  const lines: string[] = [];
  let current = "";
  let currentOctets = 0;

  for (const character of line) {
    const octets = encoder.encode(character).length;
    // A continuation line spends one of its octets on the leading space.
    const limit = lines.length === 0 ? MAX_LINE_OCTETS : MAX_LINE_OCTETS - 1;

    if (currentOctets + octets > limit) {
      lines.push(current);
      current = "";
      currentOctets = 0;
    }
    current += character;
    currentOctets += octets;
  }
  lines.push(current);

  return lines.map((physicalLine, index) => (index === 0 ? physicalLine : ` ${physicalLine}`));
};

/** `YYYYMMDDTHHMMSSZ` */
const toUtcTimestamp = (date: Date): string =>
  date
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z")
    .replaceAll(/[-:]/g, "");

const compactDate = (isoDate: string) => isoDate.replaceAll("-", "");

/** The `.ics` file for an application deadline. `stamp` is when the file was generated. */
export const buildApplicationDeadlineIcs = (
  event: ApplicationDeadlineEvent,
  stamp: Date
): string => {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//cuatclub//Application deadline//TH",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${toUtcTimestamp(stamp)}`,
    `DTSTART;VALUE=DATE:${compactDate(event.startDate)}`,
    `DTEND;VALUE=DATE:${compactDate(event.endDate)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `URL:${event.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.flatMap(foldLine).join(LINE_BREAK) + LINE_BREAK;
};
