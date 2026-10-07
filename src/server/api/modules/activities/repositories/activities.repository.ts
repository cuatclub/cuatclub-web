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
import type {
  ActivityTypeRow,
  CategoryRow,
  FacultyRow,
} from "@/server/api/modules/master-data/entities/master-data.entity";

export type CreateActivityParams = Omit<
  typeof activities.$inferInsert,
  "id" | "createdAt" | "updatedAt"
>;

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

export type PublicActivityClub = {
  id: string;
  name: string;
  logoUrl: string | null;
};

/** One activity row joined with everything the public list needs to render it. */
export type PublicActivityRow = {
  activity: Activity;
  club: PublicActivityClub;
  activityType: ActivityTypeRow;
  categories: CategoryRow[];
  faculties: FacultyRow[];
};

export type PublicActivitiesPage = {
  activities: PublicActivityRow[];
  total: number;
};

export interface IActivitiesRepository {
  create(params: CreateActivityParams, client?: DbClient): Promise<Activity>;
  existsByPosterUrl(posterUrl: string): Promise<boolean>;
  getAllByFilter(params: GetPublicActivitiesParams): Promise<PublicActivitiesPage>;
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

  async getAllByFilter(params: GetPublicActivitiesParams): Promise<PublicActivitiesPage> {
    const filter = this.buildPublicFilter(params);

    const [rows, totalRes] = await Promise.all([
      db
        .select({ activity: activities, owner: user, club: clubs, activityType: activityTypes })
        .from(activities)
        .innerJoin(clubs, eq(activities.clubId, clubs.id))
        .innerJoin(user, eq(clubs.userId, user.id))
        .innerJoin(activityTypes, eq(activities.activityTypeId, activityTypes.id))
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

    const total = totalRes[0]?.value ?? 0;
    if (rows.length === 0) return { activities: [], total };

    const activityIds = rows.map(({ activity }) => activity.id);
    const [categoriesByActivityId, facultiesByActivityId] = await Promise.all([
      this.getCategoriesByActivityIds(activityIds),
      this.getFacultiesByActivityIds(activityIds),
    ]);

    return {
      activities: rows.map(({ activity, owner, club, activityType }) => ({
        activity: Activity.toEntity(activity),
        club: { id: club.id, name: owner.name, logoUrl: owner.image },
        activityType,
        categories: categoriesByActivityId.get(activity.id) ?? [],
        faculties: facultiesByActivityId.get(activity.id) ?? [],
      })),
      total,
    };
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
    activityIds: string[]
  ): Promise<Map<string, CategoryRow[]>> {
    const rows = await db
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

  private async getFacultiesByActivityIds(
    activityIds: string[]
  ): Promise<Map<string, FacultyRow[]>> {
    const rows = await db
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
