import { eq } from "drizzle-orm";
import { db, type DbClient } from "@/server/db";
import { studentCategories } from "@/server/db/schema";
import { wrapRepoError } from "@/server/errors";

export interface IStudentCategoriesRepository {
  replaceByStudentId(studentId: string, categoryIds: number[], client?: DbClient): Promise<void>;
}

class StudentCategoriesRepository implements IStudentCategoriesRepository {
  async replaceByStudentId(
    studentId: string,
    categoryIds: number[],
    client: DbClient = db
  ): Promise<void> {
    await client
      .delete(studentCategories)
      .where(eq(studentCategories.studentId, studentId))
      .catch(wrapRepoError);
    await client
      .insert(studentCategories)
      .values(categoryIds.map((categoryId) => ({ studentId, categoryId })))
      .catch(wrapRepoError);
  }
}

export const studentCategoriesRepository = new StudentCategoriesRepository();
