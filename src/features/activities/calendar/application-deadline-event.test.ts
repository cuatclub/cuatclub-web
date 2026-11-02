import { describe, expect, it } from "vitest";

import {
  buildApplicationDeadlineEvent,
  buildGoogleCalendarUrl,
  buildOutlookCalendarUrl,
} from "@/features/activities/calendar/application-deadline-event";

const ORIGIN = "https://cuatclub.example";

const activity = (applicationEndAt: string, title = "ค่ายอาสา") => ({
  id: "a1b2c3",
  title,
  applicationEndAt: new Date(applicationEndAt),
});

describe("buildApplicationDeadlineEvent", () => {
  it("uses the Bangkok date when the deadline is late in the evening there", () => {
    const event = buildApplicationDeadlineEvent(activity("2026-11-06T16:59:00Z"), ORIGIN);

    expect(event.startDate).toBe("2026-11-06");
    expect(event.endDate).toBe("2026-11-07");
  });

  it("rolls over to the next day once Bangkok passes midnight", () => {
    const event = buildApplicationDeadlineEvent(activity("2026-11-06T17:30:00Z"), ORIGIN);

    expect(event.startDate).toBe("2026-11-07");
    expect(event.endDate).toBe("2026-11-08");
  });

  it("ends a deadline on the last day of a month on the first of the next", () => {
    const event = buildApplicationDeadlineEvent(activity("2026-12-31T10:00:00Z"), ORIGIN);

    expect(event.startDate).toBe("2026-12-31");
    expect(event.endDate).toBe("2027-01-01");
  });

  it("titles the event and gives a stable uid", () => {
    const event = buildApplicationDeadlineEvent(activity("2026-11-06T16:59:00Z"), ORIGIN);

    expect(event.title).toBe("ปิดรับสมัคร: ค่ายอาสา");
    expect(event.uid).toBe("a1b2c3-deadline@cuatclub.example");
  });

  it("describes the exact closing time in Thai, then links to the activity", () => {
    const event = buildApplicationDeadlineEvent(activity("2026-11-06T16:59:00Z"), ORIGIN);

    expect(event.url).toBe("https://cuatclub.example/activities/a1b2c3");
    expect(event.description).toBe(
      "ปิดรับสมัครวันที่ 6 พฤศจิกายน 2569 เวลา 23:59 น.\nhttps://cuatclub.example/activities/a1b2c3"
    );
  });

  it("writes midnight as 00:00 and morning times with a leading zero", () => {
    const midnight = buildApplicationDeadlineEvent(activity("2026-11-06T17:00:00Z"), ORIGIN);
    const morning = buildApplicationDeadlineEvent(activity("2026-11-06T00:00:00Z"), ORIGIN);

    expect(midnight.description).toContain("วันที่ 7 พฤศจิกายน 2569 เวลา 00:00 น.");
    expect(morning.description).toContain("วันที่ 6 พฤศจิกายน 2569 เวลา 07:00 น.");
  });
});

describe("calendar links", () => {
  const event = buildApplicationDeadlineEvent(activity("2026-11-06T16:59:00Z"), ORIGIN);

  it("builds a Google Calendar template link", () => {
    const url = new URL(buildGoogleCalendarUrl(event));

    expect(url.origin + url.pathname).toBe("https://calendar.google.com/calendar/render");
    expect(url.searchParams.get("action")).toBe("TEMPLATE");
    expect(url.searchParams.get("text")).toBe(event.title);
    expect(url.searchParams.get("dates")).toBe("20261106/20261107");
    expect(url.searchParams.get("details")).toBe(event.description);
  });

  it("builds Outlook.com and Microsoft 365 links with the same params", () => {
    const personal = new URL(buildOutlookCalendarUrl(event, "personal"));
    const work = new URL(buildOutlookCalendarUrl(event, "work"));

    expect(personal.origin + personal.pathname).toBe(
      "https://outlook.live.com/calendar/0/action/compose"
    );
    expect(work.origin + work.pathname).toBe(
      "https://outlook.office.com/calendar/0/action/compose"
    );

    for (const url of [personal, work]) {
      expect(url.searchParams.get("subject")).toBe(event.title);
      expect(url.searchParams.get("startdt")).toBe("2026-11-06");
      expect(url.searchParams.get("enddt")).toBe("2026-11-07");
      expect(url.searchParams.get("allday")).toBe("true");
      expect(url.searchParams.get("body")).toBe(event.description);
      expect(url.searchParams.get("path")).toBe("/calendar/action/compose");
      expect(url.searchParams.get("rru")).toBe("addevent");
    }
  });
});
