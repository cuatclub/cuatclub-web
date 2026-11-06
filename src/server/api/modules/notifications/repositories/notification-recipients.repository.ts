import { and, eq } from "drizzle-orm";
import { LINE_PROVIDER_ID } from "@/lib/line";
import { db, type DbClient } from "@/server/db";
import { account, studentClub, students } from "@/server/db/schema";
import { wrapRepoError } from "@/server/errors";

export type LineRecipient = { userId: string; lineUserId: string };

export interface INotificationRecipientsRepository {
  getLineRecipientsFollowingClub(clubId: string, client?: DbClient): Promise<LineRecipient[]>;
}

class NotificationRecipientsRepository implements INotificationRecipientsRepository {
  async getLineRecipientsFollowingClub(
    clubId: string,
    client: DbClient = db
  ): Promise<LineRecipient[]> {
    return client
      .select({ userId: account.userId, lineUserId: account.accountId })
      .from(studentClub)
      .innerJoin(students, eq(students.id, studentClub.studentId))
      .innerJoin(
        account,
        and(eq(account.userId, students.userId), eq(account.providerId, LINE_PROVIDER_ID))
      )
      .where(eq(studentClub.clubId, clubId))
      .catch(wrapRepoError);
  }
}

export const notificationRecipientsRepository = new NotificationRecipientsRepository();
