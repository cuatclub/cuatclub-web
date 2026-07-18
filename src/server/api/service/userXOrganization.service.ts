import type { SQL } from "drizzle-orm";
import { and, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { type ErrorOrNull, PostgreSQLError } from "@/utils/error";
import { userXOrganization } from "@/server/db/userXOrganization";

export type UserXOrganization = typeof userXOrganization.$inferSelect;

export interface IUserXOrganizationService {
	follow(userId: string, organizationId: string, trx?: typeof db): Promise<[UserXOrganization | null, ErrorOrNull]>;
	unfollow(userId: string, organizationId: string, trx?: typeof db): Promise<ErrorOrNull>;
	getFollowedOrgIds(userId: string): Promise<[string[], ErrorOrNull]>;
	isFollowing(userId: string, organizationId: string): Promise<[boolean, ErrorOrNull]>;
	getByFilter(filter?: SQL): Promise<[UserXOrganization[], ErrorOrNull]>;
}

class UserXOrganizationService implements IUserXOrganizationService {
	async follow(
		userId: string,
		organizationId: string,
		trx?: typeof db,
	): Promise<[UserXOrganization | null, ErrorOrNull]> {
		const database = trx ?? db;
		const res = await database
			.insert(userXOrganization)
			.values({ userId, organizationId })
			.onConflictDoNothing()
			.returning()
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (res instanceof Error) return [null, res];
		if (res.length === 0) {
			const existing = await database.query.userXOrganization.findFirst({
				where: and(
					eq(userXOrganization.userId, userId),
					eq(userXOrganization.organizationId, organizationId),
				),
			});
			return [existing ?? null, null];
		}
		return [res[0] ?? null, null];
	}

	async unfollow(userId: string, organizationId: string, trx?: typeof db): Promise<ErrorOrNull> {
		const database = trx ?? db;
		const res = await database
			.delete(userXOrganization)
			.where(
				and(eq(userXOrganization.userId, userId), eq(userXOrganization.organizationId, organizationId)),
			)
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (res instanceof Error) return res;
		return null;
	}

	async getFollowedOrgIds(userId: string): Promise<[string[], ErrorOrNull]> {
		const res = await db.query.userXOrganization
			.findMany({
				where: eq(userXOrganization.userId, userId),
				columns: { organizationId: true },
			})
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (res instanceof Error) return [[], res];
		return [res.map((row) => row.organizationId), null];
	}

	async isFollowing(userId: string, organizationId: string): Promise<[boolean, ErrorOrNull]> {
		const res = await db.query.userXOrganization
			.findFirst({
				where: and(
					eq(userXOrganization.userId, userId),
					eq(userXOrganization.organizationId, organizationId),
				),
			})
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (res instanceof Error) return [false, res];
		return [!!res, null];
	}

	async getByFilter(filter?: SQL): Promise<[UserXOrganization[], ErrorOrNull]> {
		const res = await db.query.userXOrganization.findMany({ where: filter }).catch((e) => {
			console.log(e);
			return new PostgreSQLError();
		});

		if (res instanceof Error) return [[], res];
		return [res, null];
	}
}

export const userXOrganizationServiceImpl = new UserXOrganizationService();
