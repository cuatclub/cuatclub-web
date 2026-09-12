import type { SQL } from "drizzle-orm";
import { and, asc, desc, eq, exists, inArray, ne } from "drizzle-orm";
import { db, type DbClient } from "@/server/db";
import { activities, activityCategories, clubs } from "@/server/db/schema";
import { wrapRepoError } from "@/server/errors";
import {
  Activity,
  type ActivityRow,
} from "@/server/api/modules/activities/entities/activity.entity";
import { ActivityDetail } from "@/server/api/modules/activities/entities/activity-detail.entity";
import { Club } from "@/server/api/modules/clubs/entities/club.entity";
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

// Shape of the join used by detail queries. Lives here, not on ActivityDetail — the
// repository owns persistence shape; the entity only knows about other entities.
type ActivityDetailRow = ActivityRow & {
  activityType: ActivityTypeRow;
  categories: { category: CategoryRow }[];
  faculties: { faculty: FacultyRow }[];
};

export interface IActivitiesRepository {
  create(params: CreateActivityParams, client?: DbClient): Promise<Activity>;
  getDetailById(id: string, client?: DbClient): Promise<ActivityDetail | null>;
  getRelatedByCategoryIds(
    params: GetRelatedActivitiesParams,
    client?: DbClient
  ): Promise<ActivityDetail[]>;
  existsByPosterUrl(posterUrl: string): Promise<boolean>;
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
    const res = await client.query.activities
      .findFirst({
        where: eq(activities.id, id),
        with: {
          activityType: true,
          categories: { with: { category: true } },
          faculties: { with: { faculty: true } },
        },
      })
      .catch(wrapRepoError);

    return res ? this.toActivityDetail(res) : null;
  }

  async getRelatedByCategoryIds(
    params: GetRelatedActivitiesParams,
    client: DbClient = db
  ): Promise<ActivityDetail[]> {
    const res = await client.query.activities
      .findMany({
        where: and(
          ne(activities.id, params.excludeActivityId),
          this.hasCategory(inArray(activityCategories.categoryId, params.categoryIds)),
          this.isFromPubliclyVisibleClub()
        ),
        with: {
          activityType: true,
          categories: { with: { category: true } },
          faculties: { with: { faculty: true } },
        },
        orderBy: [desc(activities.createdAt), asc(activities.id)],
        limit: params.limit,
      })
      .catch(wrapRepoError);

    return res.map((row) => this.toActivityDetail(row));
  }

  async existsByPosterUrl(posterUrl: string): Promise<boolean> {
    const res = await db.query.activities
      .findFirst({ where: eq(activities.posterUrl, posterUrl) })
      .catch(wrapRepoError);

    return !!res;
  }

  private toActivityDetail(row: ActivityDetailRow): ActivityDetail {
    return ActivityDetail.compose({
      activity: Activity.toEntity(row),
      activityType: row.activityType,
      categories: row.categories.map(({ category }) => category),
      faculties: row.faculties.map(({ faculty }) => faculty),
    });
  }

  private hasCategory(condition: SQL): SQL {
    return exists(
      db
        .select({ activityId: activityCategories.activityId })
        .from(activityCategories)
        .where(and(eq(activityCategories.activityId, activities.id), condition))
    );
  }

  private isFromPubliclyVisibleClub(): SQL {
    return exists(
      db
        .select({ id: clubs.id })
        .from(clubs)
        .where(
          and(
            eq(clubs.id, activities.clubId),
            eq(clubs.registrationStatus, Club.PUBLICLY_VISIBLE_STATUS)
          )
        )
    );
  }
}

export const activitiesRepository = new ActivitiesRepository();
