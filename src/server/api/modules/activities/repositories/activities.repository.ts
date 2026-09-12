import type { SQL } from "drizzle-orm";
import { and, asc, desc, eq, exists, ilike, or } from "drizzle-orm";
import { db, type DbClient } from "@/server/db";
import { activities, activityCategories, categories } from "@/server/db/schema";
import { wrapRepoError } from "@/server/errors";
import {
  Activity,
  type ActivityRow,
} from "@/server/api/modules/activities/entities/activity.entity";

export type CreateActivityParams = Omit<
  typeof activities.$inferInsert,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateActivityParams = Partial<
  Omit<typeof activities.$inferInsert, "id" | "clubId" | "createdAt" | "updatedAt">
>;

export type GetMyActivitiesParams = {
  clubId: string;
  search?: string;
  sort: "CREATED_AT_ASC" | "CREATED_AT_DESC";
};

export interface IActivitiesRepository {
  create(params: CreateActivityParams, client?: DbClient): Promise<Activity>;
  existsByPosterUrl(posterUrl: string): Promise<boolean>;
  getAllByClubId(params: GetMyActivitiesParams, client?: DbClient): Promise<Activity[]>;
  getByIdAndClubId(id: string, clubId: string, client?: DbClient): Promise<Activity | null>;
  updateByIdAndClubId(
    id: string,
    clubId: string,
    update: UpdateActivityParams,
    client?: DbClient
  ): Promise<Activity | null>;
  deleteByIdAndClubId(id: string, clubId: string, client?: DbClient): Promise<boolean>;
}

class ActivitiesRepository implements IActivitiesRepository {
  // `client` defaults to the module-level `db` so callers only need to pass
  // one explicitly when running inside unitOfWork.run() (see db/unit-of-work.ts).
  async create(params: CreateActivityParams, client: DbClient = db): Promise<Activity> {
    const res = await client.insert(activities).values(params).returning().catch(wrapRepoError);
    const row: ActivityRow = res[0]!;

    return Activity.toEntity(row);
  }

  async existsByPosterUrl(posterUrl: string): Promise<boolean> {
    const res = await db.query.activities
      .findFirst({ where: eq(activities.posterUrl, posterUrl) })
      .catch(wrapRepoError);

    return !!res;
  }

  async getAllByClubId(params: GetMyActivitiesParams, client: DbClient = db): Promise<Activity[]> {
    const filter = this.buildFilter(params.clubId, params.search);

    const rows = await client
      .select()
      .from(activities)
      .where(filter)
      .orderBy(
        params.sort === "CREATED_AT_ASC" ? asc(activities.createdAt) : desc(activities.createdAt),
        asc(activities.id)
      )
      .catch(wrapRepoError);

    return Activity.toEntities(rows);
  }

  async getByIdAndClubId(
    id: string,
    clubId: string,
    client: DbClient = db
  ): Promise<Activity | null> {
    const res = await client.query.activities
      .findFirst({ where: and(eq(activities.id, id), eq(activities.clubId, clubId)) })
      .catch(wrapRepoError);

    return res ? Activity.toEntity(res) : null;
  }

  async updateByIdAndClubId(
    id: string,
    clubId: string,
    update: UpdateActivityParams,
    client: DbClient = db
  ): Promise<Activity | null> {
    const res = await client
      .update(activities)
      .set(update)
      .where(and(eq(activities.id, id), eq(activities.clubId, clubId)))
      .returning()
      .catch(wrapRepoError);

    return res[0] ? Activity.toEntity(res[0]) : null;
  }

  async deleteByIdAndClubId(id: string, clubId: string, client: DbClient = db): Promise<boolean> {
    const res = await client
      .delete(activities)
      .where(and(eq(activities.id, id), eq(activities.clubId, clubId)))
      .returning({ id: activities.id })
      .catch(wrapRepoError);

    return res.length > 0;
  }

  private buildFilter(clubId: string, search?: string): SQL | undefined {
    const conditions: SQL[] = [eq(activities.clubId, clubId)];

    if (search) {
      const pattern = `%${search.replace(/[\\%_]/g, "\\$&")}%`;
      const matchesSearch = or(
        ilike(activities.title, pattern),
        ilike(activities.description, pattern),
        this.hasCategory(ilike(categories.label, pattern))
      );
      if (matchesSearch) conditions.push(matchesSearch);
    }

    return and(...conditions);
  }

  private hasCategory(condition: SQL): SQL {
    return exists(
      db
        .select({ activityId: activityCategories.activityId })
        .from(activityCategories)
        .innerJoin(categories, eq(activityCategories.categoryId, categories.id))
        .where(and(eq(activityCategories.activityId, activities.id), condition))
    );
  }
}

export const activitiesRepository = new ActivitiesRepository();
