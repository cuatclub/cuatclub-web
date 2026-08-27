import type { SQL } from "drizzle-orm";
import { and, asc, count, desc, eq, exists, ilike, inArray, or, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db, type DbClient } from "@/server/db";
import { affiliations, categories, clubCategories, clubs, user } from "@/server/db/schema";
import { wrapRepoError } from "@/server/errors";
import { Club, type ClubRow } from "@/server/api/modules/clubs/entities/club.entity";
import { User } from "@/server/api/modules/users/user.entity";
import { ClubDetail } from "@/server/api/modules/clubs/entities/club-detail.entity";
import type { CategoryRow } from "@/server/api/modules/master-data/master-data.entity";

export type CreateClubParams = Omit<typeof clubs.$inferInsert, "id" | "createdAt" | "updatedAt">;
export type UpdateClubParams = Partial<Omit<ClubRow, "id" | "userId" | "createdAt" | "updatedAt">>;

export type GetPublicClubsParams = {
  search?: string;
  categoryIds?: number[];
  affiliationIds?: number[];
  sort: "NAME_ASC" | "NAME_DESC";
  page: number;
  pageSize: number;
};

export type PublicClubsPage = {
  clubs: ClubDetail[];
  total: number;
};

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
  getAllDetailByFilter(params: GetPublicClubsParams): Promise<PublicClubsPage>;
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

  async getAllDetailByFilter(params: GetPublicClubsParams): Promise<PublicClubsPage> {
    const filter = this.buildPublicFilter(params);
    const sortableName = sql`lower(${user.name})`;

    const [rows, totalRes] = await Promise.all([
      db
        .select({ club: clubs, owner: user, affiliation: affiliations })
        .from(clubs)
        .innerJoin(user, eq(clubs.userId, user.id))
        .leftJoin(affiliations, eq(clubs.affiliationId, affiliations.id))
        .where(filter)
        .orderBy(
          params.sort === "NAME_DESC" ? desc(sortableName) : asc(sortableName),
          asc(clubs.id)
        )
        .limit(params.pageSize)
        .offset((params.page - 1) * params.pageSize)
        .catch(wrapRepoError),
      db
        .select({ value: count() })
        .from(clubs)
        .innerJoin(user, eq(clubs.userId, user.id))
        .leftJoin(affiliations, eq(clubs.affiliationId, affiliations.id))
        .where(filter)
        .catch(wrapRepoError),
    ]);

    const total = totalRes[0]?.value ?? 0;
    if (rows.length === 0) return { clubs: [], total };

    const categoriesByClubId = await this.getCategoriesByClubIds(rows.map(({ club }) => club.id));

    return {
      clubs: rows.map(({ club, owner, affiliation }) =>
        ClubDetail.compose({
          club: Club.toEntity(club),
          owner: User.toEntity(owner),
          affiliation,
          categories: categoriesByClubId.get(club.id) ?? [],
        })
      ),
      total,
    };
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

  private buildPublicFilter(params: GetPublicClubsParams): SQL | undefined {
    const conditions: SQL[] = [eq(clubs.registrationStatus, Club.PUBLICLY_VISIBLE_STATUS)];

    if (params.affiliationIds?.length) {
      conditions.push(inArray(clubs.affiliationId, params.affiliationIds));
    }

    if (params.categoryIds?.length) {
      conditions.push(this.hasCategory(inArray(clubCategories.categoryId, params.categoryIds)));
    }

    if (params.search) {
      const pattern = `%${params.search.replace(/[\\%_]/g, "\\$&")}%`;
      const matchesSearch = or(
        ilike(user.name, pattern),
        ilike(clubs.shortDescription, pattern),
        ilike(affiliations.label, pattern),
        this.hasCategory(ilike(categories.label, pattern))
      );
      if (matchesSearch) conditions.push(matchesSearch);
    }

    return and(...conditions);
  }

  private hasCategory(condition: SQL): SQL {
    return exists(
      db
        .select({ clubId: clubCategories.clubId })
        .from(clubCategories)
        .innerJoin(categories, eq(clubCategories.categoryId, categories.id))
        .where(and(eq(clubCategories.clubId, clubs.id), condition))
    );
  }

  private async getCategoriesByClubIds(clubIds: string[]): Promise<Map<string, CategoryRow[]>> {
    const rows = await db
      .select({ clubId: clubCategories.clubId, category: categories })
      .from(clubCategories)
      .innerJoin(categories, eq(clubCategories.categoryId, categories.id))
      .where(inArray(clubCategories.clubId, clubIds))
      .catch(wrapRepoError);

    const byClubId = new Map<string, CategoryRow[]>();
    for (const { clubId, category } of rows) {
      byClubId.set(clubId, [...(byClubId.get(clubId) ?? []), category]);
    }

    return byClubId;
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
