import { eq } from "drizzle-orm";
import { db, type DbClient } from "@/server/db";
import { activityCategories } from "@/server/db/schema";
import { wrapRepoError } from "@/server/errors";

export interface IActivityCategoriesRepository {
  createActivityCategoryByActivityId(
    activityId: string,
    update: number[],
    client?: DbClient
  ): Promise<void>;
}

class ActivityCategoriesRepository implements IActivityCategoriesRepository {
  async createActivityCategoryByActivityId(
    activityId: string,
    update: number[],
    client: DbClient = db
  ): Promise<void> {
    await client
      .delete(activityCategories)
      .where(eq(activityCategories.activityId, activityId))
      .catch(wrapRepoError);
    await client
      .insert(activityCategories)
      .values(update.map((categoryId) => ({ activityId, categoryId })))
      .catch(wrapRepoError);

    return;
  }
}

export const activityCategoriesRepository = new ActivityCategoriesRepository();
