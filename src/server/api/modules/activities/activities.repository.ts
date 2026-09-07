import { db, type DbClient } from "@/server/db";
import { activities } from "@/server/db/schema";
import { wrapRepoError } from "@/server/errors";
import { Activity } from "@/server/api/modules/activities/entities/activity.entity";

export type CreateActivityParams = Omit<
  typeof activities.$inferInsert,
  "id" | "createdAt" | "updatedAt"
>;

export interface IActivitiesRepository {
  create(params: CreateActivityParams, client?: DbClient): Promise<Activity>;
}

class ActivitiesRepository implements IActivitiesRepository {
  // `client` defaults to the module-level `db` so callers only need to pass
  // one explicitly when running inside unitOfWork.run() (see db/unit-of-work.ts).
  async create(params: CreateActivityParams, client: DbClient = db): Promise<Activity> {
    const res = await client.insert(activities).values(params).returning().catch(wrapRepoError);

    return Activity.toEntity(res[0]!);
  }
}

export const activitiesRepository = new ActivitiesRepository();
