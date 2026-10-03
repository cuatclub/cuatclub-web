import { eq, inArray } from "drizzle-orm";
import { db, type DbClient } from "@/server/db";
import { activityFaculties, faculties } from "@/server/db/schema";
import { wrapRepoError } from "@/server/errors";
import type { FacultyRow } from "@/server/api/modules/master-data/entities/master-data.entity";

export interface IActivityFacultiesRepository {
  createActivityFacultyByActivityId(
    activityId: string,
    update: number[],
    client?: DbClient
  ): Promise<void>;
  getFacultiesByActivityIds(
    activityIds: string[],
    client?: DbClient
  ): Promise<Map<string, FacultyRow[]>>;
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

  async getFacultiesByActivityIds(
    activityIds: string[],
    client: DbClient = db
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

export const activityFacultiesRepository = new ActivityFacultiesRepository();
