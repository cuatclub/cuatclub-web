export interface RenderNewActivityFromFollowedClubTextParams {
  clubName: string;
  activityTitle: string;
  activityUrl: string;
}

export function renderNewActivityFromFollowedClubText(
  params: RenderNewActivityFromFollowedClubTextParams
): string {
  return [
    `📢 ${params.clubName} โพสต์กิจกรรมใหม่`,
    params.activityTitle,
    "",
    `ดูรายละเอียด: ${params.activityUrl}`,
  ].join("\n");
}
