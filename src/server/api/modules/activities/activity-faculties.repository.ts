import { eq } from "drizzle-orm";
import { db, type DbClient } from "@/server/db";
import { activityFaculties } from "@/server/db/schema";
import { wrapRepoError } from "@/server/errors";

export interface IActivityFacultiesRepository {
  createActivityFacultyByActivityId(
    activityId: string,
    update: number[],
    client?: DbClient
  ): Promise<void>;
}

class ActivityFacultiesRepository implements IActivityFacultiesRepository {
  async createActivityFacultyByActivityId(
    activityId: string,
    update: number[],
    client: DbClient = db
  ): Promise<void> {
    await client
      .delete(activityFaculties)
      .where(eq(activityFaculties.activityId, activityId))
      .catch(wrapRepoError);
    await client
      .insert(activityFaculties)
      .values(update.map((facultyId) => ({ activityId, facultyId })))
      .catch(wrapRepoError);

    return;
  }
}

export const activityFacultiesRepository = new ActivityFacultiesRepository();
