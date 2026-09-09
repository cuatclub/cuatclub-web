import { eq } from "drizzle-orm";
import { db, type DbClient } from "@/server/db";
import { activities } from "@/server/db/schema";
import { wrapRepoError } from "@/server/errors";
import {
  Activity,
  type ActivityRow,
} from "@/server/api/modules/activities/entities/activity.entity";

export type CreateActivityParams = Omit<
  typeof activities.$inferInsert,
  "id" | "createdAt" | "updatedAt"
>;

export interface IActivitiesRepository {
  create(params: CreateActivityParams, client?: DbClient): Promise<Activity>;
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

  async existsByPosterUrl(posterUrl: string): Promise<boolean> {
    const res = await db.query.activities
      .findFirst({ where: eq(activities.posterUrl, posterUrl) })
      .catch(wrapRepoError);

    return !!res;
  }
}

export const activitiesRepository = new ActivitiesRepository();
