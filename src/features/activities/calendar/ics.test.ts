import { describe, expect, it } from "vitest";

import { buildApplicationDeadlineEvent } from "@/features/activities/calendar/application-deadline-event";
import { buildApplicationDeadlineIcs } from "@/features/activities/calendar/ics";

const ORIGIN = "https://cuatclub.example";
const STAMP = new Date("2026-10-26T03:04:05.678Z");

const buildIcs = (title: string) =>
  buildApplicationDeadlineIcs(
    buildApplicationDeadlineEvent(
      { id: "a1b2c3", title, applicationEndAt: new Date("2026-11-06T16:59:00Z") },
      ORIGIN
    ),
    STAMP
  );

const unfold = (ics: string) => ics.replaceAll("\r\n ", "");

describe("buildApplicationDeadlineIcs", () => {
  const ics = buildIcs("ค่ายอาสา");

  it("separates every line with CRLF and ends with one", () => {
    expect(ics.endsWith("\r\n")).toBe(true);
    expect(ics.replaceAll("\r\n", "")).not.toMatch(/[\r\n]/);
  });

  it("wraps one event in a calendar", () => {
    const lines = ics.split("\r\n");

    expect(lines.slice(0, 5)).toEqual([
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//cuatclub//Application deadline//TH",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ]);
    expect(lines.filter((line) => line === "BEGIN:VEVENT")).toHaveLength(1);
    expect(lines.at(-2)).toBe("END:VCALENDAR");
  });

  it("gives the event a stable uid, an all-day span and a UTC stamp", () => {
    const lines = unfold(ics).split("\r\n");

    expect(lines).toContain("UID:a1b2c3-deadline@cuatclub.example");
    expect(lines).toContain("DTSTAMP:20261026T030405Z");
    expect(lines).toContain("DTSTART;VALUE=DATE:20261106");
    expect(lines).toContain("DTEND;VALUE=DATE:20261107");
    expect(lines).toContain("URL:https://cuatclub.example/activities/a1b2c3");
    expect(lines).toContain("SUMMARY:ปิดรับสมัคร: ค่ายอาสา");
  });

  it("escapes backslashes, semicolons, commas and line breaks in text values", () => {
    const lines = unfold(buildIcs("A\\B; C, D\nE")).split("\r\n");

    expect(lines).toContain("SUMMARY:ปิดรับสมัคร: A\\\\B\\; C\\, D\\nE");
    expect(lines.find((line) => line.startsWith("DESCRIPTION:"))).toContain(
      "น.\\nhttps://cuatclub.example/activities/a1b2c3"
    );
  });

  it("folds long Thai lines at 75 octets without splitting a character", () => {
    const title = "กิจกรรมรับน้องและแนะนำชมรมสำหรับนิสิตใหม่ประจำปีการศึกษา".repeat(4);
    const longIcs = buildIcs(title);
    const encoder = new TextEncoder();

    const physicalLines = longIcs.split("\r\n").slice(0, -1);
    expect(physicalLines.some((line) => line.startsWith(" "))).toBe(true);
    for (const line of physicalLines) {
      expect(encoder.encode(line).length).toBeLessThanOrEqual(75);
    }

    // A split inside a character would leave U+FFFD behind when decoded.
    expect(longIcs).not.toContain("�");
    expect(unfold(longIcs)).toContain(`SUMMARY:ปิดรับสมัคร: ${title}\r\n`);
  });
});
