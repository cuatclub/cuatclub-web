import { eq, inArray } from "drizzle-orm";
import { db, type DbClient } from "@/server/db";
import { activityCategories, categories } from "@/server/db/schema";
import { wrapRepoError } from "@/server/errors";
import type { CategoryRow } from "@/server/api/modules/master-data/entities/master-data.entity";

export interface IActivityCategoriesRepository {
  createActivityCategoryByActivityId(
    activityId: string,
    update: number[],
    client?: DbClient
  ): Promise<void>;
  getCategoriesByActivityIds(
    activityIds: string[],
    client?: DbClient
  ): Promise<Map<string, CategoryRow[]>>;
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

  async getCategoriesByActivityIds(
    activityIds: string[],
    client: DbClient = db
  ): Promise<Map<string, CategoryRow[]>> {
    const rows = await client
      .select({ activityId: activityCategories.activityId, category: categories })
      .from(activityCategories)
      .innerJoin(categories, eq(activityCategories.categoryId, categories.id))
      .where(inArray(activityCategories.activityId, activityIds))
      .catch(wrapRepoError);

    const byActivityId = new Map<string, CategoryRow[]>();
    for (const { activityId, category } of rows) {
      byActivityId.set(activityId, [...(byActivityId.get(activityId) ?? []), category]);
    }

    return byActivityId;
  }
}

export const activityCategoriesRepository = new ActivityCategoriesRepository();
