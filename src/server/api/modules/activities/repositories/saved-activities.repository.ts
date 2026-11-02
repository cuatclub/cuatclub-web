import { and, count, desc, eq, ilike } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { db, type DbClient } from "@/server/db";
import { activities, clubs, savedActivities } from "@/server/db/schema";
import { wrapRepoError } from "@/server/errors";
import { Club } from "@/server/api/modules/clubs/entities/club.entity";

export type GetSavedActivityIdsPageParams = {
  userId: string;
  search?: string;
  page: number;
  pageSize: number;
};

export type SavedActivityIdsPage = {
  activityIds: string[];
  total: number;
};

export interface ISavedActivitiesRepository {
  save(userId: string, activityId: string, client?: DbClient): Promise<void>;
  unsave(userId: string, activityId: string, client?: DbClient): Promise<void>;
  getActivityIdsByUserId(userId: string, client?: DbClient): Promise<string[]>;
  getPageByUserId(
    params: GetSavedActivityIdsPageParams,
    client?: DbClient
  ): Promise<SavedActivityIdsPage>;
}

class SavedActivitiesRepository implements ISavedActivitiesRepository {
  // Saving twice is a no-op, so a double click or a stale tab never surfaces a conflict.
  async save(userId: string, activityId: string, client: DbClient = db): Promise<void> {
    await client
      .insert(savedActivities)
      .values({ userId, activityId })
      .onConflictDoNothing()
      .catch(wrapRepoError);
  }

  async unsave(userId: string, activityId: string, client: DbClient = db): Promise<void> {
    await client
      .delete(savedActivities)
      .where(and(eq(savedActivities.userId, userId), eq(savedActivities.activityId, activityId)))
      .catch(wrapRepoError);
  }

  async getActivityIdsByUserId(userId: string, client: DbClient = db): Promise<string[]> {
    const rows = await client
      .select({ activityId: savedActivities.activityId })
      .from(savedActivities)
      .where(eq(savedActivities.userId, userId))
      .catch(wrapRepoError);

    return rows.map(({ activityId }) => activityId);
  }

  // Returns the ids in the order they're shown (newest save first) rather than the activities
  // themselves: the activities repository owns loading an activity's detail, and a page's worth
  // of ids is all the usecase needs to hand it. Activities of clubs that aren't publicly visible
  // are left out, since their page is a 404.
  async getPageByUserId(
    params: GetSavedActivityIdsPageParams,
    client: DbClient = db
  ): Promise<SavedActivityIdsPage> {
    const filter = this.buildFilter(params.userId, params.search);

    const [rows, totalRes] = await Promise.all([
      client
        .select({ activityId: savedActivities.activityId })
        .from(savedActivities)
        .innerJoin(activities, eq(savedActivities.activityId, activities.id))
        .innerJoin(clubs, eq(activities.clubId, clubs.id))
        .where(filter)
        .orderBy(desc(savedActivities.createdAt), desc(savedActivities.activityId))
        .limit(params.pageSize)
        .offset((params.page - 1) * params.pageSize)
        .catch(wrapRepoError),
      client
        .select({ value: count() })
        .from(savedActivities)
        .innerJoin(activities, eq(savedActivities.activityId, activities.id))
        .innerJoin(clubs, eq(activities.clubId, clubs.id))
        .where(filter)
        .catch(wrapRepoError),
    ]);

    return {
      activityIds: rows.map(({ activityId }) => activityId),
      total: totalRes[0]?.value ?? 0,
    };
  }

  private buildFilter(userId: string, search?: string): SQL | undefined {
    const conditions: SQL[] = [
      eq(savedActivities.userId, userId),
      eq(clubs.registrationStatus, Club.PUBLICLY_VISIBLE_STATUS),
    ];

    if (search) {
      const pattern = `%${search.replace(/[\\%_]/g, "\\$&")}%`;
      conditions.push(ilike(activities.title, pattern));
    }

    return and(...conditions);
  }
}

export const savedActivitiesRepository = new SavedActivitiesRepository();
