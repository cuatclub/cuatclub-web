import type { SQL } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "@/server/db";
import { ErrorCategory, ErrorWithCategory, type ErrorOrNull, PostgreSQLError } from "@/utils/error";
import type {
	Organization,
	OrganizationMineDTO,
	OrganizationWithUser,
	CreateOrganizationRequest,
	UpdateMineInfoStepInput,
	UpdateMineSocialsStepInput,
} from "@/server/api/dto/organization.dto";
import { organization } from "@/server/db/organization";
import { interestXOrganization } from "@/server/db/interestXOrganization";
import { user } from "@/server/db/auth-schema";
import { eq } from "drizzle-orm";
import { userServiceImpl } from "@/server/api/service/user.service";

export interface IOrganizationService {
	create(req: CreateOrganizationRequest, trx?: typeof db): Promise<[string | null, ErrorOrNull]>;
	getByFilter(filter?: SQL): Promise<[OrganizationWithUser[] | [], ErrorOrNull]>;
	getOneByFilter(filter: SQL): Promise<[OrganizationWithUser | null, ErrorOrNull]>;
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
				with: {
					user: true,
					interests: {
						with: {
							interest: true,
						},
					},
				},
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
				with: {
					user: true,
					interests: {
						with: {
							interest: true,
						},
					},
				},
			})
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (res instanceof Error) return [null, res];
		if (!res) return [null, new ErrorWithCategory("Organization not found", ErrorCategory.ResourceNotFound)];
		return [res as OrganizationWithUser, null];
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
				detailedDescription: res.detailedDescription,
				gallery: res.gallery,
				image: res.image,
				ownerContact: res.ownerContact,
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
				...(input.instagram?.trim() ? { instagram: input.instagram.trim() } : {}),
				...(input.discord?.trim() ? { discord: input.discord.trim() } : {}),
				...(input.facebook?.trim() ? { facebook: input.facebook.trim() } : {}),
				...(input.tiktok?.trim() ? { tiktok: input.tiktok.trim() } : {}),
				...(input.line?.trim() ? { line: input.line.trim() } : {}),
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
