import { describe, expect, it } from "vitest";
import { renderNewActivityFromFollowedClubText } from "@/server/services/line/templates";

const base = {
  clubName: "ชมรมดนตรีสากล",
  activityTitle: "รับสมัครสมาชิกใหม่ 2569",
  activityUrl: "https://cuatclub.example/activities/abc",
};

describe("renderNewActivityFromFollowedClubText", () => {
  it("names the club and the activity, and links to it", () => {
    expect(renderNewActivityFromFollowedClubText(base)).toBe(
      [
        "📢 ชมรมดนตรีสากล โพสต์กิจกรรมใหม่",
        "รับสมัครสมาชิกใหม่ 2569",
        "",
        "ดูรายละเอียด: https://cuatclub.example/activities/abc",
      ].join("\n")
    );
  });
});
