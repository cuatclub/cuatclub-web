import { eq } from "drizzle-orm";
import { db, type DbClient } from "@/server/db";
import { clubCategories } from "@/server/db/schema";
import { wrapRepoError } from "@/server/errors";

export interface IClubCategoriesRepository {
  createCategoryClubByClubId(clubId: string, update: number[], client?: DbClient): Promise<void>;
  existsByCategoryId(categoryId: number): Promise<boolean>;
}

class ClubCategoriesRepository implements IClubCategoriesRepository {
  async createCategoryClubByClubId(
    clubId: string,
    update: number[],
    client: DbClient = db
  ): Promise<void> {
    await client
      .delete(clubCategories)
      .where(eq(clubCategories.clubId, clubId))
      .catch(wrapRepoError);
    await client
      .insert(clubCategories)
      .values(update.map((categoryId) => ({ clubId, categoryId })))
      .catch(wrapRepoError);

    return;
  }

  async existsByCategoryId(categoryId: number): Promise<boolean> {
    const res = await db.query.clubCategories
      .findFirst({ where: eq(clubCategories.categoryId, categoryId) })
      .catch(wrapRepoError);

    return !!res;
  }
}

export const clubCategoriesRepository = new ClubCategoriesRepository();
