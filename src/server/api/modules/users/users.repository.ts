import type { SQL } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db, type DbClient } from "@/server/db";
import { user } from "@/server/db/schema/user";
import { wrapRepoError } from "@/server/errors";
import { User, type UserRow } from "@/server/api/modules/users/user.entity";

export type UpdateUserParams = Partial<Omit<UserRow, "id" | "createdAt" | "updatedAt">>;

export interface IUsersRepository {
  getById(id: string): Promise<User | null>;
  updateById(id: string, update: UpdateUserParams, client?: DbClient): Promise<void>;
}

class UsersRepository implements IUsersRepository {
  async getById(id: string): Promise<User | null> {
    return this.getOneByFilter(eq(user.id, id));
  }

  private async getOneByFilter(filter: SQL): Promise<User | null> {
    const res = await db.query.user.findFirst({ where: filter }).catch(wrapRepoError);

    return res ? User.toEntity(res) : null;
  }

  async updateById(id: string, update: UpdateUserParams, client: DbClient = db): Promise<void> {
    await this.updateByFilter(eq(user.id, id), update, client);
  }

  private async updateByFilter(
    filter: SQL,
    update: UpdateUserParams,
    client: DbClient = db
  ): Promise<void> {
    await client.update(user).set(update).where(filter).catch(wrapRepoError);
  }
}

export const usersRepository = new UsersRepository();
