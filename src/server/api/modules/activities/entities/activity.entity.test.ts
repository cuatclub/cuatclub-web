import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Activity,
  type ActivityRow,
} from "@/server/api/modules/activities/entities/activity.entity";

const NOW = new Date("2026-10-21T12:00:00.000Z");

const row = (applicationEndAt: Date): ActivityRow => ({
  id: "00000000-0000-0000-0000-000000000001",
  clubId: "00000000-0000-0000-0000-000000000002",
  activityTypeId: 1,
  title: "title",
  description: "description",
  posterUrl: "https://example.com/poster.jpg",
  audience: "CHULA_STUDENT",
  yearLevels: [],
  applicationFormUrl: "https://example.com/form",
  applicationStartAt: new Date("2026-10-01T00:00:00.000Z"),
  applicationEndAt,
  createdAt: NOW,
  updatedAt: NOW,
});

describe("Activity.isApplicationClosed", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is true once the end instant has passed", () => {
    const activity = Activity.toEntity(row(new Date("2026-10-21T11:59:59.999Z")));
    expect(activity.isApplicationClosed).toBe(true);
  });

  it("is false at the exact end instant, like isApplicationOpen", () => {
    expect(Activity.toEntity(row(NOW)).isApplicationClosed).toBe(false);
  });

  it("is false while the end is in the future", () => {
    const activity = Activity.toEntity(row(new Date("2026-10-22T00:00:00.000Z")));
    expect(activity.isApplicationClosed).toBe(false);
  });
});
