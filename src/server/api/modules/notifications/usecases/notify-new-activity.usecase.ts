import { activitiesRepository } from "@/server/api/modules/activities/repositories/activities.repository";
import { notificationRecipientsRepository } from "@/server/api/modules/notifications/repositories/notification-recipients.repository";
import { sendNewActivityFromFollowedClubMessage } from "@/server/services/line";

export const notifyNewActivity = async (activityId: string): Promise<void> => {
  try {
    const detail = await activitiesRepository.getDetailById(activityId);
    if (!detail || detail.activity.isApplicationClosed) return;

    const followers = await notificationRecipientsRepository.getLineRecipientsFollowingClub(
      detail.clubSummary.id
    );

    await sendNewActivityFromFollowedClubMessage({
      to: followers.map((r) => r.lineUserId),
      activityId,
      activityTitle: detail.activity.title,
      clubName: detail.clubSummary.name,
    });
  } catch (error) {
    console.error("notifications: new activity fan-out failed", { activityId, error });
  }
};
