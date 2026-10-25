import type { SQL } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db, type DbClient } from "@/server/db";
import { students } from "@/server/db/schema";
import { wrapRepoError } from "@/server/errors";
import { Student, type StudentRow } from "@/server/api/modules/students/entities/student.entity";

export type CreateStudentParams = Omit<
  typeof students.$inferInsert,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateStudentParams = Partial<
  Omit<StudentRow, "id" | "userId" | "createdAt" | "updatedAt">
>;

export interface IStudentsRepository {
  create(req: CreateStudentParams, client?: DbClient): Promise<string>;
  getByUserId(userId: string): Promise<Student | null>;
  getByUsername(username: string): Promise<Student | null>;
  updateById(id: string, update: UpdateStudentParams, client?: DbClient): Promise<void>;
}

class StudentsRepository implements IStudentsRepository {
  // `client` defaults to the module-level `db` so callers only need to pass
  // one explicitly when running inside unitOfWork.run() (see db/unit-of-work.ts).
  async create(req: CreateStudentParams, client: DbClient = db): Promise<string> {
    const id = randomUUID();
    const res = await client
      .insert(students)
      .values({ ...req, id })
      .returning({ id: students.id })
      .catch(wrapRepoError);

    return res[0]!.id;
  }

  async getByUserId(userId: string): Promise<Student | null> {
    return this.getOneByFilter(eq(students.userId, userId));
  }

  async getByUsername(username: string): Promise<Student | null> {
    return this.getOneByFilter(eq(students.username, username));
  }

  async updateById(id: string, update: UpdateStudentParams, client: DbClient = db): Promise<void> {
    await client.update(students).set(update).where(eq(students.id, id)).catch(wrapRepoError);
  }

  private async getOneByFilter(filter: SQL): Promise<Student | null> {
    const res = await db.query.students.findFirst({ where: filter }).catch(wrapRepoError);

    return res ? Student.toEntity(res) : null;
  }
}

export const studentsRepository = new StudentsRepository();
