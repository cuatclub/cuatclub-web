import { and, eq } from "drizzle-orm";
import { db, type DbClient } from "@/server/db";
import { clubCategories } from "@/server/db/schema/club-categories";
import { type categories } from "@/server/db/schema/categories";
import { wrapRepoError } from "@/server/errors";
import { Club, type ClubRow } from "@/server/api/modules/clubs/club.entity";
import { ClubCategories } from "@/server/api/modules/club-categories/club-categories.entity";

export type CategoryRow = typeof categories.$inferSelect;
export type CreateClubCategoryParams = typeof clubCategories.$inferInsert;
export type UpdateClubCategoryParams = Partial<CreateClubCategoryParams>;

export interface IClubCategoriesRepository {
  create(req: CreateClubCategoryParams, client?: DbClient): Promise<void>;
  update(
    clubId: string,
    categoryId: number,
    update: UpdateClubCategoryParams,
    client?: DbClient
  ): Promise<void>;
  delete(clubId: string, categoryId: number, client?: DbClient): Promise<void>;
  getByClubId(clubId: string): Promise<ClubCategories[]>;
  getByCategoryId(categoryId: number): Promise<ClubCategories[]>;
  getClubsByCategoryId(categoryId: number): Promise<Club[]>;
  getCategoriesByClubId(clubId: string): Promise<CategoryRow[]>;
}

class ClubCategoriesRepository implements IClubCategoriesRepository {
  async create(req: CreateClubCategoryParams, client: DbClient = db): Promise<void> {
    await client.insert(clubCategories).values(req).catch(wrapRepoError);
  }

  async update(
    clubId: string,
    categoryId: number,
    update: UpdateClubCategoryParams,
    client: DbClient = db
  ): Promise<void> {
    await client
      .update(clubCategories)
      .set(update)
      .where(and(eq(clubCategories.clubId, clubId), eq(clubCategories.categoryId, categoryId)))
      .catch(wrapRepoError);
  }

  async delete(clubId: string, categoryId: number, client: DbClient = db): Promise<void> {
    await client
      .delete(clubCategories)
      .where(and(eq(clubCategories.clubId, clubId), eq(clubCategories.categoryId, categoryId)))
      .catch(wrapRepoError);
  }

  async getByClubId(clubId: string): Promise<ClubCategories[]> {
    const res = await db.query.clubCategories
      .findMany({
        where: eq(clubCategories.clubId, clubId),
      })
      .catch(wrapRepoError);

    return ClubCategories.toEntities(res);
  }

  async getByCategoryId(categoryId: number): Promise<ClubCategories[]> {
    const res = await db.query.clubCategories
      .findMany({
        where: eq(clubCategories.categoryId, categoryId),
      })
      .catch(wrapRepoError);

    return ClubCategories.toEntities(res);
  }

  async getClubsByCategoryId(categoryId: number): Promise<Club[]> {
    const rows = await db.query.clubCategories
      .findMany({
        where: eq(clubCategories.categoryId, categoryId),
        with: { club: true },
      })
      .catch(wrapRepoError);

    return Club.toEntities(rows.map((row) => row.club as ClubRow));
  }

  async getCategoriesByClubId(clubId: string): Promise<CategoryRow[]> {
    const rows = await db.query.clubCategories
      .findMany({
        where: eq(clubCategories.clubId, clubId),
        with: { category: true },
      })
      .catch(wrapRepoError);

    return rows.map((row) => row.category);
  }
}

export const clubCategoriesRepository = new ClubCategoriesRepository();
