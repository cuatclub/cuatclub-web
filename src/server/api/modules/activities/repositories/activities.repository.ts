import type { SQL } from "drizzle-orm";
import {
  and,
  arrayOverlaps,
  asc,
  count,
  desc,
  eq,
  exists,
  ilike,
  inArray,
  ne,
  or,
  sql,
} from "drizzle-orm";
import { db, type DbClient } from "@/server/db";
import {
  activities,
  activityCategories,
  activityFaculties,
  activityTypes,
  categories,
  clubs,
  faculties,
  user,
} from "@/server/db/schema";
import { wrapRepoError } from "@/server/errors";
import {
  Activity,
  type ActivityRow,
} from "@/server/api/modules/activities/entities/activity.entity";
import { ActivityDetail } from "@/server/api/modules/activities/entities/activity-detail.entity";
import { Club, type ClubRow } from "@/server/api/modules/clubs/entities/club.entity";
import { User, type UserRow } from "@/server/api/modules/users/entities/user.entity";
import type {
  ActivityTypeRow,
  CategoryRow,
  FacultyRow,
} from "@/server/api/modules/master-data/entities/master-data.entity";

export type CreateActivityParams = Omit<
  typeof activities.$inferInsert,
  "id" | "createdAt" | "updatedAt"
>;

export type GetRelatedActivitiesParams = {
  excludeActivityId: string;
  categoryIds: number[];
  limit: number;
};

export type UpdateActivityParams = Partial<
  Omit<typeof activities.$inferInsert, "id" | "clubId" | "createdAt" | "updatedAt">
>;

export type GetMyActivitiesParams = {
  clubId: string;
  search?: string;
  sort: "CREATED_AT_ASC" | "CREATED_AT_DESC";
};

export type GetPublicActivitiesParams = {
  search?: string;
  categoryIds?: number[];
  activityTypeIds?: number[];
  facultyIds?: number[];
  audience?: "CHULA_STUDENT" | "GENERAL_PUBLIC";
  yearLevels?: number[];
  sort: "CREATED_AT_DESC" | "CREATED_AT_ASC";
  page: number;
  pageSize: number;
};

export type PublicActivitiesPage = {
  activities: ActivityDetail[];
  total: number;
};

// Shape of the join used by detail queries. Lives here, not on ActivityDetail — the
// repository owns persistence shape; the entity only knows about other entities.
type ActivityDetailRow = {
  activity: ActivityRow;
  club: ClubRow;
  owner: UserRow;
  activityType: ActivityTypeRow;
};

export interface IActivitiesRepository {
  create(params: CreateActivityParams, client?: DbClient): Promise<Activity>;
  getDetailById(id: string, client?: DbClient): Promise<ActivityDetail | null>;
  getRelatedByCategoryIds(
    params: GetRelatedActivitiesParams,
    client?: DbClient
  ): Promise<ActivityDetail[]>;
  existsByPosterUrl(posterUrl: string): Promise<boolean>;
  getAllDetailByClubId(params: GetMyActivitiesParams, client?: DbClient): Promise<ActivityDetail[]>;
  getByIdAndClubId(id: string, clubId: string, client?: DbClient): Promise<Activity | null>;
  updateByIdAndClubId(
    id: string,
    clubId: string,
    update: UpdateActivityParams,
    client?: DbClient
  ): Promise<Activity | null>;
  deleteByIdAndClubId(id: string, clubId: string, client?: DbClient): Promise<boolean>;
  getAllDetailByFilter(params: GetPublicActivitiesParams): Promise<PublicActivitiesPage>;
}

class ActivitiesRepository implements IActivitiesRepository {
  // `client` defaults to the module-level `db` so callers only need to pass
  // one explicitly when running inside unitOfWork.run() (see db/unit-of-work.ts).
  async create(params: CreateActivityParams, client: DbClient = db): Promise<Activity> {
    const res = await client.insert(activities).values(params).returning().catch(wrapRepoError);
    const row: ActivityRow = res[0]!;

    return Activity.toEntity(row);
  }

  // Returns null when nothing matches — that's a normal result, not a
  // repository error. The usecase decides whether that's a not-found error.
  async getDetailById(id: string, client: DbClient = db): Promise<ActivityDetail | null> {
    const rows = await this.selectDetailRows(client)
      .where(eq(activities.id, id))
      .limit(1)
      .catch(wrapRepoError);

    const [detail] = await this.toDetails(rows, client);
    return detail ?? null;
  }

  async getRelatedByCategoryIds(
    params: GetRelatedActivitiesParams,
    client: DbClient = db
  ): Promise<ActivityDetail[]> {
    const rows = await this.selectDetailRows(client)
      .where(
        and(
          ne(activities.id, params.excludeActivityId),
          eq(clubs.registrationStatus, Club.PUBLICLY_VISIBLE_STATUS),
          this.hasCategory(inArray(activityCategories.categoryId, params.categoryIds))
        )
      )
      .orderBy(desc(activities.createdAt), asc(activities.id))
      .limit(params.limit)
      .catch(wrapRepoError);

    return this.toDetails(rows, client);
  }

  async existsByPosterUrl(posterUrl: string): Promise<boolean> {
    const res = await db.query.activities
      .findFirst({ where: eq(activities.posterUrl, posterUrl) })
      .catch(wrapRepoError);

    return !!res;
  }

  async getAllDetailByClubId(
    params: GetMyActivitiesParams,
    client: DbClient = db
  ): Promise<ActivityDetail[]> {
    const filter = this.buildFilter(params.clubId, params.search);

    const rows = await this.selectDetailRows(client)
      .where(filter)
      .orderBy(
        params.sort === "CREATED_AT_ASC" ? asc(activities.createdAt) : desc(activities.createdAt),
        asc(activities.id)
      )
      .catch(wrapRepoError);

    return this.toDetails(rows, client);
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

  async getAllDetailByFilter(params: GetPublicActivitiesParams): Promise<PublicActivitiesPage> {
    const filter = this.buildPublicFilter(params);

    const [rows, totalRes] = await Promise.all([
      this.selectDetailRows(db)
        .where(filter)
        .orderBy(
          params.sort === "CREATED_AT_ASC" ? asc(activities.createdAt) : desc(activities.createdAt),
          asc(activities.id)
        )
        .limit(params.pageSize)
        .offset((params.page - 1) * params.pageSize)
        .catch(wrapRepoError),
      db
        .select({ value: count() })
        .from(activities)
        .innerJoin(clubs, eq(activities.clubId, clubs.id))
        .innerJoin(user, eq(clubs.userId, user.id))
        .innerJoin(activityTypes, eq(activities.activityTypeId, activityTypes.id))
        .where(filter)
        .catch(wrapRepoError),
    ]);

    return { activities: await this.toDetails(rows), total: totalRes[0]?.value ?? 0 };
  }

  private selectDetailRows(client: DbClient) {
    return client
      .select({ activity: activities, club: clubs, owner: user, activityType: activityTypes })
      .from(activities)
      .innerJoin(clubs, eq(activities.clubId, clubs.id))
      .innerJoin(user, eq(clubs.userId, user.id))
      .innerJoin(activityTypes, eq(activities.activityTypeId, activityTypes.id));
  }

  private async toDetails(
    rows: ActivityDetailRow[],
    client: DbClient = db
  ): Promise<ActivityDetail[]> {
    if (rows.length === 0) return [];

    const activityIds = rows.map(({ activity }) => activity.id);
    const [categoriesByActivityId, facultiesByActivityId] = await Promise.all([
      this.getCategoriesByActivityIds(activityIds, client),
      this.getFacultiesByActivityIds(activityIds, client),
    ]);

    return rows.map(({ activity, club, owner, activityType }) =>
      ActivityDetail.compose({
        activity: Activity.toEntity(activity),
        club: Club.toEntity(club),
        owner: User.toEntity(owner),
        activityType,
        categories: categoriesByActivityId.get(activity.id) ?? [],
        faculties: facultiesByActivityId.get(activity.id) ?? [],
      })
    );
  }

  private buildPublicFilter(params: GetPublicActivitiesParams): SQL | undefined {
    const conditions: SQL[] = [];

    if (params.activityTypeIds?.length) {
      conditions.push(inArray(activities.activityTypeId, params.activityTypeIds));
    }

    if (params.audience) {
      conditions.push(eq(activities.audience, params.audience));
    }

    if (params.categoryIds?.length) {
      conditions.push(this.hasCategory(inArray(activityCategories.categoryId, params.categoryIds)));
    }

    if (params.facultyIds?.length) {
      conditions.push(this.hasFaculty(inArray(activityFaculties.facultyId, params.facultyIds)));
    }

    if (params.yearLevels?.length) {
      const matchesYearLevel = or(
        arrayOverlaps(activities.yearLevels, params.yearLevels),
        sql`cardinality(${activities.yearLevels}) = 0`
      );
      if (matchesYearLevel) conditions.push(matchesYearLevel);
    }

    if (params.search) {
      const pattern = `%${params.search.replace(/[\\%_]/g, "\\$&")}%`;
      const matchesSearch = or(
        ilike(activities.title, pattern),
        ilike(activities.description, pattern),
        ilike(user.name, pattern),
        this.hasCategory(ilike(categories.label, pattern)),
        this.hasFaculty(ilike(faculties.label, pattern))
      );
      if (matchesSearch) conditions.push(matchesSearch);
    }

    return conditions.length ? and(...conditions) : undefined;
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

  private hasFaculty(condition: SQL): SQL {
    return exists(
      db
        .select({ activityId: activityFaculties.activityId })
        .from(activityFaculties)
        .innerJoin(faculties, eq(activityFaculties.facultyId, faculties.id))
        .where(and(eq(activityFaculties.activityId, activities.id), condition))
    );
  }

  private async getCategoriesByActivityIds(
    activityIds: string[],
    client: DbClient
  ): Promise<Map<string, CategoryRow[]>> {
    const rows = await client
      .select({ activityId: activityCategories.activityId, category: categories })
      .from(activityCategories)
      .innerJoin(categories, eq(activityCategories.categoryId, categories.id))
      .where(inArray(activityCategories.activityId, activityIds))
      .orderBy(asc(categories.id))
      .catch(wrapRepoError);

    const byActivityId = new Map<string, CategoryRow[]>();
    for (const { activityId, category } of rows) {
      byActivityId.set(activityId, [...(byActivityId.get(activityId) ?? []), category]);
    }

    return byActivityId;
  }

  private async getFacultiesByActivityIds(
    activityIds: string[],
    client: DbClient
  ): Promise<Map<string, FacultyRow[]>> {
    const rows = await client
      .select({ activityId: activityFaculties.activityId, faculty: faculties })
      .from(activityFaculties)
      .innerJoin(faculties, eq(activityFaculties.facultyId, faculties.id))
      .where(inArray(activityFaculties.activityId, activityIds))
      .catch(wrapRepoError);

    const byActivityId = new Map<string, FacultyRow[]>();
    for (const { activityId, faculty } of rows) {
      byActivityId.set(activityId, [...(byActivityId.get(activityId) ?? []), faculty]);
    }

    return byActivityId;
  }
}

export const activitiesRepository = new ActivitiesRepository();
