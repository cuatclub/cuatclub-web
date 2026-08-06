import type { CreateUserRequest, User } from "../dto/user.dto";
import type { SQL } from "drizzle-orm";
import { type ErrorOrNull, ErrorWithCategory, ErrorCategory, PostgreSQLError } from "@/utils/error";
import { db } from "@/server/db";
import { user } from "@/server/db/schema/user";

export interface IUserService {
    getByFilter(filter?: SQL): Promise<[User[] | [], ErrorOrNull]>;
    getOneByFilter(filter: SQL): Promise<[User | null, ErrorOrNull]>;
    update(filter: SQL, update: Partial<User>, trx?: typeof db): Promise<ErrorOrNull>;
    delete(filter: SQL, trx?: typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0]): Promise<ErrorOrNull>;
}

class UserService implements IUserService {
    async getByFilter(filter?: SQL): Promise<[User[], ErrorOrNull]> {
        const res = await db.query.user.findMany({ where: filter }).catch((e) => {
            console.log(e);
            return new PostgreSQLError();
        });

        if (res instanceof Error) return [[], res];
        return [res, null];
    }

    async getOneByFilter(filter: SQL): Promise<[User | null, ErrorOrNull]> {
        const res = await db.query.user.findFirst({ where: filter }).catch((e) => {
            console.log(e);
            return new PostgreSQLError();
        });

        if (res instanceof Error) return [null, res];
        if (!res) return [null, new ErrorWithCategory("User not found", ErrorCategory.ResourceNotFound)];
        return [res, null];
    }

    async update(filter: SQL, update: Partial<User>, trx?: typeof db): Promise<ErrorOrNull> {
        const database = trx ?? db;

        const res = await database
            .update(user)
            .set({ ...update })
            .where(filter)
            .returning({ updatedId: user.id })
            .catch((e) => {
                console.log(e);
                return new PostgreSQLError();
            });

        if (res instanceof Error) return res;
        if (res.length === 0) return new ErrorWithCategory("User not found", ErrorCategory.ResourceNotFound);
        return null;
    }

    async delete(filter: SQL, trx?: typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0]): Promise<ErrorOrNull> {
        const database = trx ?? db;
        const res = await database
            .delete(user)
            .where(filter)
            .catch((e) => {
                console.log(e);
                return new PostgreSQLError();
            });

        if (res instanceof Error) return res;
        return null;
    }
}

export const userServiceImpl = new UserService();
