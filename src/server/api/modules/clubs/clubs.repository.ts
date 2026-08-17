import type { SQL } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db, type DbClient } from "@/server/db";
import { clubs, type affiliations, type categories, type user } from "@/server/db/schema";
import { wrapRepoError } from "@/server/errors";
import { Club, type ClubRow } from "@/server/api/modules/clubs/entities/club.entity";
import { User } from "@/server/api/modules/users/user.entity";
import { ClubDetail } from "@/server/api/modules/clubs/entities/club-detail.entity";

export type CreateClubParams = Omit<typeof clubs.$inferInsert, "id" | "createdAt" | "updatedAt">;
export type UpdateClubParams = Partial<Omit<ClubRow, "id" | "userId" | "createdAt" | "updatedAt">>;

// Shape of the join used by getDetailById. Lives here, not on ClubDetail — the
// repository owns persistence shape; the entity only knows about other entities.
type ClubDetailRow = ClubRow & {
  user: typeof user.$inferSelect;
  affiliation: typeof affiliations.$inferSelect | null;
  categories: { category: typeof categories.$inferSelect }[];
};

export interface IClubsRepository {
  create(req: CreateClubParams, client?: DbClient): Promise<string>;
  getById(id: string): Promise<Club | null>;
  getDetailById(id: string): Promise<ClubDetail | null>;
  getByUserId(userId: string): Promise<Club | null>;
  getByFilter(filter?: SQL): Promise<Club[]>;
  updateById(id: string, update: UpdateClubParams, client?: DbClient): Promise<void>;
  deleteById(id: string, client?: DbClient): Promise<void>;
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

  async updateById(id: string, update: UpdateClubParams, client: DbClient = db): Promise<void> {
    return this.updateByFilter(eq(clubs.id, id), update, client);
  }

  async deleteById(id: string, client: DbClient = db): Promise<void> {
    return this.deleteByFilter(eq(clubs.id, id), client);
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

    return res ? this.toClubDetail(res) : null;
  }

  private toClubDetail(row: ClubDetailRow): ClubDetail {
    return ClubDetail.compose({
      club: Club.toEntity(row),
      owner: User.toEntity(row.user),
      affiliation: row.affiliation,
      categories: row.categories.map(({ category }) => category),
    });
  }

  private async updateByFilter(
    filter: SQL,
    update: UpdateClubParams,
    client: DbClient
  ): Promise<void> {
    await client.update(clubs).set(update).where(filter).catch(wrapRepoError);
  }

  private async deleteByFilter(filter: SQL, client: DbClient): Promise<void> {
    await client.delete(clubs).where(filter).catch(wrapRepoError);
  }
}

export const clubsRepository = new ClubsRepository();
