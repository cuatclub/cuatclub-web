import type { SQL } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "@/server/db";
import { ErrorCategory, ErrorWithCategory, type ErrorOrNull, PostgreSQLError } from "@/utils/error";
import type {
	ClubCardDTO,
	DiscoverClubsRequest,
	DiscoverClubsResponse,
	Organization,
	OrganizationMineDTO,
	OrganizationWithUser,
	CreateOrganizationRequest,
	UpdateMineInfoStepInput,
	UpdateMineSocialsStepInput,
} from "@/server/api/dto/organization.dto";
import { organization } from "@/server/db/organization";
import { interestXOrganization } from "@/server/db/interestXOrganization";
import { interest } from "@/server/db/interest";
import { faculty } from "@/server/db/faculty";
import { post } from "@/server/db/post";
import { userXOrganization } from "@/server/db/userXOrganization";
import { user } from "@/server/db/auth-schema";
import { and, asc, count, eq, exists, ilike, inArray, or, sql } from "drizzle-orm";
import { userServiceImpl } from "@/server/api/service/user.service";

/** Keep a literal `%` or `_` typed into the search box from acting as a LIKE wildcard. */
function escapeLike(value: string): string {
	return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export interface IOrganizationService {
	create(req: CreateOrganizationRequest, trx?: typeof db): Promise<[string | null, ErrorOrNull]>;
	getByFilter(filter?: SQL): Promise<[OrganizationWithUser[] | [], ErrorOrNull]>;
	getOneByFilter(filter: SQL): Promise<[OrganizationWithUser | null, ErrorOrNull]>;
	discoverClubs(
		req: DiscoverClubsRequest,
		viewerId: string | null,
	): Promise<[DiscoverClubsResponse | null, ErrorOrNull]>;
	update(filter: SQL, update: Partial<Organization>, trx?: typeof db): Promise<ErrorOrNull>;
	delete(filter: SQL): Promise<ErrorOrNull>;
	getMineByUserId(userId: string): Promise<[OrganizationMineDTO | null, ErrorOrNull]>;
	ensureMineForUser(userId: string): Promise<[{ id: string } | null, ErrorOrNull]>;
	updateMineInfo(userId: string, input: UpdateMineInfoStepInput): Promise<ErrorOrNull>;
	updateMineSocials(userId: string, input: UpdateMineSocialsStepInput): Promise<ErrorOrNull>;
	setMineInterests(userId: string, interestIds: string[]): Promise<ErrorOrNull>;
}

class OrganizationService implements IOrganizationService {
	async create(req: CreateOrganizationRequest, trx?: typeof db): Promise<[string | null, ErrorOrNull]> {
		const database = trx ?? db;
		const id = randomUUID();
		const res = await database
			.insert(organization)
			.values({ ...req, id })
			.returning({ id: organization.id })
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (res instanceof Error) return [null, res];
		return [res[0]?.id ?? null, null];
	}

	async getByFilter(filter?: SQL): Promise<[OrganizationWithUser[], ErrorOrNull]> {
		const res = await db.query.organization
			.findMany({
				where: filter,
				with: { user: true },
			})
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (res instanceof Error) return [[], res];
		return [res as OrganizationWithUser[], null];
	}

	async getOneByFilter(filter: SQL): Promise<[OrganizationWithUser | null, ErrorOrNull]> {
		const res = await db.query.organization
			.findFirst({
				where: filter,
				with: { user: true },
			})
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (res instanceof Error) return [null, res];
		if (!res) return [null, new ErrorWithCategory("Organization not found", ErrorCategory.ResourceNotFound)];
		return [res as OrganizationWithUser, null];
	}

	async discoverClubs(
		req: DiscoverClubsRequest,
		viewerId: string | null,
	): Promise<[DiscoverClubsResponse | null, ErrorOrNull]> {
		const { facultyIds, interestIds, pageSize } = req;

		// Visibility is enforced here, never in the client: `organization` also holds EVENT rows,
		// and a banned club must not surface (it cannot be followed either — see the follow service).
		const conditions: SQL[] = [eq(organization.category, "CLUB"), eq(organization.isBanned, false)];

		const keyword = req.q?.trim();
		if (keyword) {
			const pattern = `%${escapeLike(keyword)}%`;
			// ILIKE is case-insensitive for Latin and a no-op for Thai, which has no case.
			conditions.push(or(ilike(organization.name, pattern), ilike(organization.bio, pattern))!);
		}
		if (facultyIds?.length) {
			conditions.push(inArray(organization.facultyId, facultyIds));
		}
		if (interestIds?.length) {
			// EXISTS rather than a join: a club matching two of the chosen interests must still be one row.
			conditions.push(
				exists(
					db
						.select({ one: sql`1` })
						.from(interestXOrganization)
						.where(
							and(
								eq(interestXOrganization.organizationId, organization.id),
								inArray(interestXOrganization.interestId, interestIds),
							),
						),
				),
			);
		}

		const where = and(...conditions);

		const totalRes = await db
			.select({ value: count() })
			.from(organization)
			.where(where)
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (totalRes instanceof Error) return [null, totalRes];

		const total = totalRes[0]?.value ?? 0;
		if (total === 0) return [{ items: [], total: 0, page: 1, pageCount: 1 }, null];

		const pageCount = Math.max(1, Math.ceil(total / pageSize));
		// A page past the end (hand-typed URL) clamps to the last page rather than rendering nothing.
		const page = Math.min(req.page, pageCount);

		const followerCount = sql<number>`(
			SELECT COUNT(*)::int FROM ${userXOrganization}
			WHERE ${userXOrganization.organizationId} = ${organization.id}
		)`;
		const eventCount = sql<number>`(
			SELECT COUNT(*)::int FROM ${post}
			WHERE ${post.organizationId} = ${organization.id}
		)`;
		const isFollowing = viewerId
			? sql<boolean>`EXISTS (
				SELECT 1 FROM ${userXOrganization}
				WHERE ${userXOrganization.organizationId} = ${organization.id}
				  AND ${userXOrganization.userId} = ${viewerId}
			)`
			: sql<boolean>`FALSE`;

		const rows = await db
			.select({
				id: organization.id,
				name: organization.name,
				image: organization.image,
				bio: organization.bio,
				facultyId: faculty.id,
				facultyName: faculty.name,
				followerCount: followerCount.mapWith(Number).as("follower_count"),
				eventCount: eventCount.mapWith(Number).as("event_count"),
				isFollowing: isFollowing.mapWith(Boolean).as("is_following"),
			})
			.from(organization)
			.leftJoin(faculty, eq(organization.facultyId, faculty.id))
			.where(where)
			// Follower counts tie constantly, so name and id make the order total. Without a
			// deterministic tiebreak Postgres may order tied rows differently between two
			// LIMIT/OFFSET queries, and a club shows up on two pages — or on none.
			.orderBy(sql`follower_count DESC, ${organization.name} ASC, ${organization.id} ASC`)
			.limit(pageSize)
			.offset((page - 1) * pageSize)
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (rows instanceof Error) return [null, rows];

		const ids = rows.map((row) => row.id);
		const interestRows = await db
			.select({
				organizationId: interestXOrganization.organizationId,
				id: interest.id,
				name: interest.name,
				icon: interest.icon,
			})
			.from(interestXOrganization)
			.innerJoin(interest, eq(interestXOrganization.interestId, interest.id))
			.where(inArray(interestXOrganization.organizationId, ids))
			.orderBy(asc(interest.name))
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (interestRows instanceof Error) return [null, interestRows];

		const interestsByOrg = new Map<string, ClubCardDTO["interests"]>();
		for (const row of interestRows) {
			const list = interestsByOrg.get(row.organizationId) ?? [];
			list.push({ id: row.id, name: row.name, icon: row.icon });
			interestsByOrg.set(row.organizationId, list);
		}

		const items: ClubCardDTO[] = rows.map((row) => ({
			id: row.id,
			name: row.name,
			image: row.image,
			bio: row.bio,
			faculty: row.facultyId && row.facultyName ? { id: row.facultyId, name: row.facultyName } : null,
			interests: interestsByOrg.get(row.id) ?? [],
			followerCount: row.followerCount,
			eventCount: row.eventCount,
			isFollowing: row.isFollowing,
		}));

		return [{ items, total, page, pageCount }, null];
	}

	async update(filter: SQL, update: Partial<Organization>, trx?: typeof db): Promise<ErrorOrNull> {
		const database = trx ?? db;

		const res = await database
			.update(organization)
			.set({ ...update, updatedAt: new Date() })
			.where(filter)
			.returning({ updatedId: organization.id })
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (res instanceof Error) return res;
		if (res.length === 0) return new ErrorWithCategory("Organization not found", ErrorCategory.ResourceNotFound);
		return null;
	}

	async delete(filter: SQL): Promise<ErrorOrNull> {
		return await db
			.transaction(async (tx) => {
				const orgs = await tx
					.select({ userId: organization.userId })
					.from(organization)
					.where(filter);

				const org = orgs[0];
				if (!org) return null;

				const userId = org.userId;

				const deleteOrgRes = await tx
					.delete(organization)
					.where(filter)
					.catch((e) => {
						console.log(e);
						return new PostgreSQLError();
					});

				if (deleteOrgRes instanceof Error) return deleteOrgRes;

				const deleteUserRes = await userServiceImpl.delete(eq(user.id, userId), tx);

				if (deleteUserRes instanceof Error) throw deleteUserRes;

				return null;
			})
			.catch((e) => {
				if (e instanceof ErrorWithCategory || e instanceof PostgreSQLError) return e;
				return new PostgreSQLError();
			});
	}

	async getMineByUserId(userId: string): Promise<[OrganizationMineDTO | null, ErrorOrNull]> {
		const res = await db.query.organization
			.findFirst({
				where: eq(organization.userId, userId),
				with: { interests: true },
			})
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (res instanceof Error) return [null, res];
		if (!res) return [null, null];

		const interestIds = res.interests.map((row) => row.interestId);
		return [
			{
				id: res.id,
				name: res.name,
				facultyId: res.facultyId,
				bio: res.bio,
				image: res.image,
				socials: res.socials,
				interests: interestIds,
			},
			null,
		];
	}

	async ensureMineForUser(userId: string): Promise<[{ id: string } | null, ErrorOrNull]> {
		const u = await db.query.user
			.findFirst({
				where: eq(user.id, userId),
				columns: { role: true },
			})
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (u instanceof Error) return [null, u];
		if (u?.role !== "ORGANIZATION") {
			return [null, new ErrorWithCategory("Not an organization account", ErrorCategory.Authorization)];
		}

		const existing = await db.query.organization
			.findFirst({
				where: eq(organization.userId, userId),
				columns: { id: true },
			})
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (existing instanceof Error) return [null, existing];
		if (existing) return [{ id: existing.id }, null];

		const id = randomUUID();
		const ins = await db
			.insert(organization)
			.values({
				id,
				name: "ชมรม",
				category: "CLUB",
				userId,
				isBanned: false,
				bio: "",
				recruitmentPeriod: {},
				socials: { instagram: "", discord: "" },
			})
			.returning({ id: organization.id })
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (ins instanceof Error) return [null, ins];
		return [{ id: ins[0]?.id ?? id }, null];
	}

	async updateMineInfo(userId: string, input: UpdateMineInfoStepInput): Promise<ErrorOrNull> {
		const org = await db.query.organization
			.findFirst({
				where: eq(organization.userId, userId),
				columns: { id: true },
			})
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (org instanceof Error) return org;
		if (!org) {
			return new ErrorWithCategory("Organization not found", ErrorCategory.ResourceNotFound);
		}

		return this.update(eq(organization.id, org.id), {
			name: input.name,
			facultyId: input.facultyId,
			bio: input.bio,
			...(input.image !== undefined ? { image: input.image } : {}),
		});
	}

	async updateMineSocials(userId: string, input: UpdateMineSocialsStepInput): Promise<ErrorOrNull> {
		const org = await db.query.organization
			.findFirst({
				where: eq(organization.userId, userId),
				columns: { id: true },
			})
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (org instanceof Error) return org;
		if (!org) {
			return new ErrorWithCategory("Organization not found", ErrorCategory.ResourceNotFound);
		}

		return this.update(eq(organization.id, org.id), {
			socials: {
				instagram: input.instagram,
				discord: input.discord,
				...(input.signUpForm?.trim() ? { signUpForm: input.signUpForm.trim() } : {}),
			},
		});
	}

	async setMineInterests(userId: string, interestIds: string[]): Promise<ErrorOrNull> {
		const org = await db.query.organization
			.findFirst({
				where: eq(organization.userId, userId),
				columns: { id: true },
			})
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (org instanceof Error) return org;
		if (!org) {
			return new ErrorWithCategory("Organization not found", ErrorCategory.ResourceNotFound);
		}

		try {
			await db.transaction(async (tx) => {
				await tx.delete(interestXOrganization).where(eq(interestXOrganization.organizationId, org.id));
				if (interestIds.length > 0) {
					await tx.insert(interestXOrganization).values(
						interestIds.map((interestId) => ({
							organizationId: org.id,
							interestId,
						})),
					);
				}
			});
		} catch (e) {
			if (e instanceof ErrorWithCategory || e instanceof PostgreSQLError) return e;
			console.log(e);
			return new PostgreSQLError();
		}

		return null;
	}
}

export const organizationServiceImpl = new OrganizationService();
