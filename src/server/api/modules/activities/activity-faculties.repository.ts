import { eq } from "drizzle-orm";
import { db, type DbClient } from "@/server/db";
import { activityFaculties } from "@/server/db/schema";
import { wrapRepoError } from "@/server/errors";

export interface IActivityFacultiesRepository {
  setForActivity(activityId: string, facultyIds: number[], client?: DbClient): Promise<void>;
}

class ActivityFacultiesRepository implements IActivityFacultiesRepository {
  async setForActivity(
    activityId: string,
    facultyIds: number[],
    client: DbClient = db
  ): Promise<void> {
    await client
      .delete(activityFaculties)
      .where(eq(activityFaculties.activityId, activityId))
      .catch(wrapRepoError);
    await client
      .insert(activityFaculties)
      .values(facultyIds.map((facultyId) => ({ activityId, facultyId })))
      .catch(wrapRepoError);

    return;
  }
}

export const activityFacultiesRepository = new ActivityFacultiesRepository();
