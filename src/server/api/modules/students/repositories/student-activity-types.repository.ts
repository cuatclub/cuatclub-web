import { eq } from "drizzle-orm";
import { db, type DbClient } from "@/server/db";
import { studentActivityTypes } from "@/server/db/schema";
import { wrapRepoError } from "@/server/errors";

export interface IStudentActivityTypesRepository {
  replaceByStudentId(
    studentId: string,
    activityTypeIds: number[],
    client?: DbClient
  ): Promise<void>;
}

class StudentActivityTypesRepository implements IStudentActivityTypesRepository {
  async replaceByStudentId(
    studentId: string,
    activityTypeIds: number[],
    client: DbClient = db
  ): Promise<void> {
    await client
      .delete(studentActivityTypes)
      .where(eq(studentActivityTypes.studentId, studentId))
      .catch(wrapRepoError);
    await client
      .insert(studentActivityTypes)
      .values(activityTypeIds.map((activityTypeId) => ({ studentId, activityTypeId })))
      .catch(wrapRepoError);
  }
}

export const studentActivityTypesRepository = new StudentActivityTypesRepository();
