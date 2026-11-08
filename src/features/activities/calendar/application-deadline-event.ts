import { THAI_MONTHS_LONG } from "@/lib/date";

/** The app's one domain timezone — an activity's closing day is the day it falls on in Bangkok,
 *  whatever the server's or the visitor's own timezone says. */
const ACTIVITY_TIME_ZONE = "Asia/Bangkok";

const BUDDHIST_YEAR_OFFSET = 543;

const closingTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: ACTIVITY_TIME_ZONE,
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  // `h23` keeps midnight as "00" — a 24-hour `hour12: false` can print it as "24".
  hourCycle: "h23",
});

const getBangkokParts = (date: Date) => {
  const parts = closingTimeFormatter.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((candidate) => candidate.type === type)?.value ?? "";

  return {
    year: Number(part("year")),
    month: Number(part("month")),
    day: Number(part("day")),
    hour: part("hour"),
    minute: part("minute"),
  };
};

/**
 * What a calendar needs to hold an activity's application deadline. Activities have no event
 * date, so the entry is an all-day one on the closing day. Dates are `YYYY-MM-DD`; `endDate` is
 * the day after `startDate`, because calendars treat an all-day event's end as exclusive.
 */
export type ApplicationDeadlineEvent = {
  uid: string;
  title: string;
  description: string;
  url: string;
  startDate: string;
  endDate: string;
};

type DeadlineActivity = {
  id: string;
  title: string;
  applicationEndAt: Date;
};

/** `origin` is the site's own, e.g. "https://cuatclub.example" — it makes the activity link and
 *  the event's stable `uid` absolute. */
export const buildApplicationDeadlineEvent = (
  activity: DeadlineActivity,
  origin: string
): ApplicationDeadlineEvent => {
  const { year, month, day, hour, minute } = getBangkokParts(activity.applicationEndAt);
  const url = `${origin}/activities/${activity.id}`;

  const start = new Date(Date.UTC(year, month - 1, day));
  const end = new Date(Date.UTC(year, month - 1, day + 1));

  return {
    uid: `${activity.id}-deadline@${new URL(origin).host}`,
    title: `ปิดรับสมัคร: ${activity.title}`,
    description: [
      `ปิดรับสมัครวันที่ ${day} ${THAI_MONTHS_LONG[month - 1]} ${
        year + BUDDHIST_YEAR_OFFSET
      } เวลา ${hour}:${minute} น.`,
      url,
    ].join("\n"),
    url,
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
};

const compactDate = (isoDate: string) => isoDate.replaceAll("-", "");

export const buildGoogleCalendarUrl = (event: ApplicationDeadlineEvent): string => {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${compactDate(event.startDate)}/${compactDate(event.endDate)}`,
    details: event.description,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
};

/** Outlook.com is a personal account; Microsoft 365 is a work or school one. */
export type OutlookAccount = "personal" | "work";

const OUTLOOK_COMPOSE_URL: Record<OutlookAccount, string> = {
  personal: "https://outlook.live.com/calendar/0/action/compose",
  work: "https://outlook.office.com/calendar/0/action/compose",
};

export const buildOutlookCalendarUrl = (
  event: ApplicationDeadlineEvent,
  account: OutlookAccount
): string => {
  const params = new URLSearchParams({
    subject: event.title,
    startdt: event.startDate,
    enddt: event.endDate,
    allday: "true",
    body: event.description,
    path: "/calendar/action/compose",
    rru: "addevent",
  });
  return `${OUTLOOK_COMPOSE_URL[account]}?${params}`;
};
