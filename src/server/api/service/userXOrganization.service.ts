import type { SQL } from "drizzle-orm";
import { count, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { ErrorCategory, ErrorWithCategory, type ErrorOrNull, PostgreSQLError } from "@/utils/error";
import { userXOrganization } from "@/server/db/userXOrganization";
import { organization } from "@/server/db/organization";
import { user } from "@/server/db/auth-schema";
import type { Organization } from "@/server/api/dto/organization.dto";
import type {
    UserXOrganization,
    CreateUserXOrganizationRequest,
    PublicUser,
} from "@/server/api/dto/userXOrganization.dto";

export interface IUserXOrganizationService {
    getByFilter(filter?: SQL): Promise<[UserXOrganization[], ErrorOrNull]>;
    getOneByFilter(filter: SQL): Promise<[UserXOrganization | null, ErrorOrNull]>;
    getFollowedOrganizations(filter: SQL): Promise<[Organization[], ErrorOrNull]>;
    getFollowers(filter: SQL): Promise<[PublicUser[], ErrorOrNull]>;
    countFollowers(filter: SQL): Promise<[number, ErrorOrNull]>;
    create(req: CreateUserXOrganizationRequest): Promise<[UserXOrganization | null, ErrorOrNull]>;
    delete(filter: SQL): Promise<ErrorOrNull>;
}

class UserXOrganizationService implements IUserXOrganizationService {
    async getByFilter(filter?: SQL): Promise<[UserXOrganization[], ErrorOrNull]> {
        const res = await db
            .select()
            .from(userXOrganization)
            .where(filter)
            .catch((e) => {
                console.log(e);
                return new PostgreSQLError();
            });

        if (res instanceof Error) return [[], res];
        return [res, null];
    }

    async getOneByFilter(filter: SQL): Promise<[UserXOrganization | null, ErrorOrNull]> {
        const res = await db
            .select()
            .from(userXOrganization)
            .where(filter)
            .catch((e) => {
                console.log(e);
                return new PostgreSQLError();
            });

        if (res instanceof Error) return [null, res];
        if (res.length === 0)
            return [null, new ErrorWithCategory("UserXOrganization not found", ErrorCategory.ResourceNotFound)];
        return [res[0]!, null];
    }

    async getFollowedOrganizations(filter: SQL): Promise<[Organization[], ErrorOrNull]> {
        const res = await db
            .select({ organization })
            .from(userXOrganization)
            .innerJoin(organization, eq(userXOrganization.organizationId, organization.id))
            .where(filter)
            .catch((e) => {
                console.log(e);
                return new PostgreSQLError();
            });

        if (res instanceof Error) return [[], res];
        return [res.map((r) => r.organization), null];
    }

    async getFollowers(filter: SQL): Promise<[PublicUser[], ErrorOrNull]> {
        // Follower lists are exposed to other users — select no email or other PII.
        const res = await db
            .select({ id: user.id, name: user.name, image: user.image })
            .from(userXOrganization)
            .innerJoin(user, eq(userXOrganization.userId, user.id))
            .where(filter)
            .catch((e) => {
                console.log(e);
                return new PostgreSQLError();
            });

        if (res instanceof Error) return [[], res];
        return [res, null];
    }

    async countFollowers(filter: SQL): Promise<[number, ErrorOrNull]> {
        const res = await db
            .select({ count: count() })
            .from(userXOrganization)
            .where(filter)
            .catch((e) => {
                console.log(e);
                return new PostgreSQLError();
            });

        if (res instanceof Error) return [0, res];
        return [res[0]?.count ?? 0, null];
    }

    async create(req: CreateUserXOrganizationRequest): Promise<[UserXOrganization | null, ErrorOrNull]> {
        const orgs = await db
            .select({ userId: organization.userId, isBanned: organization.isBanned })
            .from(organization)
            .where(eq(organization.id, req.organizationId))
            .catch((e) => {
                console.log(e);
                return new PostgreSQLError();
            });

        if (orgs instanceof Error) return [null, orgs];
        const org = orgs[0];
        if (!org)
            return [null, new ErrorWithCategory("Organization not found", ErrorCategory.ResourceNotFound)];
        if (org.userId === req.userId)
            return [null, new ErrorWithCategory("Cannot follow your own organization", ErrorCategory.BusinessLogic)];
        if (org.isBanned)
            return [null, new ErrorWithCategory("Cannot follow a banned organization", ErrorCategory.BusinessLogic)];

        const res = await db
            .insert(userXOrganization)
            .values(req)
            .onConflictDoNothing({ target: [userXOrganization.userId, userXOrganization.organizationId] })
            .returning()
            .catch((e) => {
                console.log(e);
                return new PostgreSQLError();
            });

        if (res instanceof Error) return [null, res];
        // Empty returning() means the row already existed (conflict skipped) — still a success.
        return [res[0] ?? { userId: req.userId, organizationId: req.organizationId }, null];
    }

    async delete(filter: SQL): Promise<ErrorOrNull> {
        const res = await db
            .delete(userXOrganization)
            .where(filter)
            .returning()
            .catch((e) => {
                console.log(e);
                return new PostgreSQLError();
            });

        if (res instanceof Error) return res;
        if (res.length === 0)
            return new ErrorWithCategory("Not following this organization", ErrorCategory.ResourceNotFound);
        return null;
    }
}

export const userXOrganizationServiceImpl = new UserXOrganizationService();
