import type { SQL } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { user } from "@/server/db/schema/user";
import { wrapRepoError } from "@/server/errors";
import { User } from "@/server/api/modules/users/user.entity";

export interface IUsersRepository {
  getById(id: string): Promise<User | null>;
}

class UsersRepository implements IUsersRepository {
  async getById(id: string): Promise<User | null> {
    return this.getOneByFilter(eq(user.id, id));
  }

  private async getOneByFilter(filter: SQL): Promise<User | null> {
    const res = await db.query.user.findFirst({ where: filter }).catch(wrapRepoError);

    return res ? User.toEntity(res) : null;
  }
}

export const usersRepository = new UsersRepository();
