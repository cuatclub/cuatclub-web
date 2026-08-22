import type { SQL } from "drizzle-orm";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db, type DbClient } from "@/server/db";
import { clubCategories } from "@/server/db/schema/club-categories";
import { type categories } from "@/server/db/schema/categories";
import { clubs } from "@/server/db/schema/clubs";
import { wrapRepoError } from "@/server/errors";
import { Club, type ClubRow } from "@/server/api/modules/clubs/club.entity";
import { ClubDetail } from "@/server/api/modules/clubs/club-detail.entity";

export type CategoryRow = typeof categories.$inferSelect;
export type CreateClubParams = Omit<typeof clubs.$inferInsert, "id" | "createdAt" | "updatedAt">;
export type UpdateClubParams = Partial<Omit<ClubRow, "id" | "userId" | "createdAt" | "updatedAt">>;

export interface IClubsRepository {
  create(req: CreateClubParams, client?: DbClient): Promise<string>;
  getById(id: string): Promise<Club | null>;
  getDetailById(id: string): Promise<ClubDetail | null>;
  getByUserId(userId: string): Promise<Club | null>;
  getByFilter(filter?: SQL): Promise<Club[]>;
  getCategoryByClubId(clubId: string): Promise<CategoryRow[]>;
  updateById(id: string, update: UpdateClubParams, client?: DbClient): Promise<void>;
}

class ClubsRepository implements IClubsRepository {
  // `client` defaults to the module-level `db` so callers only need to pass
  // one explicitly when running inside unitOfWork.run() (see db/unit-of-work.ts).
  async create(req: CreateClubParams, client: DbClient = db): Promise<string> {
    const id = randomUUID();
    const res = await client
      .insert(clubs)
      .values({ ...req, id })
      .returning({ id: clubs.id })
      .catch(wrapRepoError);

    return res[0]!.id;
  }

  async getById(id: string): Promise<Club | null> {
    return this.getOneByFilter(eq(clubs.id, id));
  }

  async getDetailById(id: string): Promise<ClubDetail | null> {
    return this.getOneDetailByFilter(eq(clubs.id, id));
  }

  async getByUserId(userId: string): Promise<Club | null> {
    return this.getOneByFilter(eq(clubs.userId, userId));
  }

  async getByFilter(filter?: SQL): Promise<Club[]> {
    const res = await db.query.clubs.findMany({ where: filter }).catch(wrapRepoError);

    return Club.toEntities(res);
  }

  async createCategoryClubByClubId(clubId: string, update: number[]): Promise<void> {
    await db.delete(clubCategories).where(eq(clubCategories.clubId, clubId)).catch(wrapRepoError);
    await db
      .insert(clubCategories)
      .values(update.map((categoryId) => ({ clubId, categoryId })))
      .catch(wrapRepoError);

    return;
  }

  async getCategoryByClubId(clubId: string): Promise<CategoryRow[]> {
    const rows = await db.query.clubCategories
      .findMany({
        where: eq(clubCategories.clubId, clubId),
        with: { category: true },
      })
      .catch(wrapRepoError);

    return rows.map((row) => row.category);
  }

  async updateById(id: string, update: UpdateClubParams, client: DbClient = db): Promise<void> {
    return this.updateByFilter(eq(clubs.id, id), update, client);
  }

  // Returns null when nothing matches — that's a normal result, not a
  // repository error. The usecase decides whether that's a not-found error.
  private async getOneByFilter(filter: SQL): Promise<Club | null> {
    const res = await db.query.clubs.findFirst({ where: filter }).catch(wrapRepoError);

    return res ? Club.toEntity(res) : null;
  }

  private async getOneDetailByFilter(filter: SQL): Promise<ClubDetail | null> {
    const res = await db.query.clubs
      .findFirst({
        where: filter,
        with: { user: true, affiliation: true, categories: { with: { category: true } } },
      })
      .catch(wrapRepoError);

    return res ? ClubDetail.toEntity(res) : null;
  }

  private async updateByFilter(
    filter: SQL,
    update: UpdateClubParams,
    client: DbClient
  ): Promise<void> {
    await client.update(clubs).set(update).where(filter).catch(wrapRepoError);
  }
}

export const clubsRepository = new ClubsRepository();
