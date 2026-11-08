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
  createIfMissing(req: CreateStudentParams, client?: DbClient): Promise<void>;
  getByUserId(userId: string, client?: DbClient): Promise<Student | null>;
  getByUsername(username: string, client?: DbClient): Promise<Student | null>;
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

  // For rows that may be created concurrently (see getStudentRegistration): a second insert for
  // the same user is a no-op instead of a unique-constraint failure.
  async createIfMissing(req: CreateStudentParams, client: DbClient = db): Promise<void> {
    await client
      .insert(students)
      .values({ ...req, id: randomUUID() })
      .onConflictDoNothing({ target: students.userId })
      .catch(wrapRepoError);
  }

  async getByUserId(userId: string, client: DbClient = db): Promise<Student | null> {
    return this.getOneByFilter(eq(students.userId, userId), client);
  }

  async getByUsername(username: string, client: DbClient = db): Promise<Student | null> {
    return this.getOneByFilter(eq(students.username, username), client);
  }

  async updateById(id: string, update: UpdateStudentParams, client: DbClient = db): Promise<void> {
    await client.update(students).set(update).where(eq(students.id, id)).catch(wrapRepoError);
  }

  private async getOneByFilter(filter: SQL, client: DbClient = db): Promise<Student | null> {
    const res = await client.query.students.findFirst({ where: filter }).catch(wrapRepoError);

    return res ? Student.toEntity(res) : null;
  }
}

export const studentsRepository = new StudentsRepository();
