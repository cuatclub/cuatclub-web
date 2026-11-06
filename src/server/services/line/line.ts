import { env } from "@/config/env";
import { renderNewActivityFromFollowedClubText } from "./templates";
import { multicastViaLine } from "./transport";

export async function sendNewActivityFromFollowedClubMessage(params: {
  to: string[];
  activityId: string;
  activityTitle: string;
  clubName: string;
}): Promise<void> {
  const { to, activityId, activityTitle, clubName } = params;

  const activityUrl = `${env.APP_BASE_URL}/activities/${activityId}`;
  const text = renderNewActivityFromFollowedClubText({ clubName, activityTitle, activityUrl });

  await multicastViaLine({ to, messages: [{ type: "text", text }] });
}
