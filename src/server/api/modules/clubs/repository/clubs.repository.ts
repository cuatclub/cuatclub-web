import type { SQL } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "@/server/db";
import { clubs } from "@/server/db/clubs";
import { clubCategories } from "@/server/db/club-categories";
import { type ErrorOrNull, ErrorWithCategory, ErrorCategory, PostgreSQLError } from "@/utils/error";
import type { ClubRow, ClubWithRelations } from "@/server/api/modules/clubs/entity/club.entity";

const withRelations = {
	faculty: true,
	categories: { with: { category: true } },
} as const;

type Trx = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

export interface IClubsRepository {
	insertPending(req: { userId: string; email: string }, trx?: Trx): Promise<[string | null, ErrorOrNull]>;
	findByUserId(userId: string): Promise<[ClubWithRelations | null, ErrorOrNull]>;
	findById(id: string): Promise<[ClubWithRelations | null, ErrorOrNull]>;
	findMany(filter?: SQL): Promise<[ClubWithRelations[], ErrorOrNull]>;
	update(filter: SQL, update: Partial<ClubRow>): Promise<ErrorOrNull>;
	setCategories(clubId: string, categoryIds: number[]): Promise<ErrorOrNull>;
}

class ClubsRepository implements IClubsRepository {
	async insertPending(req: { userId: string; email: string }, trx?: Trx): Promise<[string | null, ErrorOrNull]> {
		const database = trx ?? db;
		const id = randomUUID();
		const res = await database
			.insert(clubs)
			.values({ id, userId: req.userId, email: req.email, registrationStatus: "pending" })
			.returning({ id: clubs.id })
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (res instanceof Error) return [null, res];
		return [res[0]?.id ?? null, null];
	}

	async findByUserId(userId: string): Promise<[ClubWithRelations | null, ErrorOrNull]> {
		const res = await db.query.clubs
			.findFirst({ where: eq(clubs.userId, userId), with: withRelations })
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (res instanceof Error) return [null, res];
		return [(res as ClubWithRelations) ?? null, null];
	}

	async findById(id: string): Promise<[ClubWithRelations | null, ErrorOrNull]> {
		const res = await db.query.clubs
			.findFirst({ where: eq(clubs.id, id), with: withRelations })
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (res instanceof Error) return [null, res];
		return [(res as ClubWithRelations) ?? null, null];
	}

	async findMany(filter?: SQL): Promise<[ClubWithRelations[], ErrorOrNull]> {
		const res = await db.query.clubs
			.findMany({ where: filter, with: withRelations })
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (res instanceof Error) return [[], res];
		return [res as ClubWithRelations[], null];
	}

	async update(filter: SQL, update: Partial<ClubRow>): Promise<ErrorOrNull> {
		const res = await db
			.update(clubs)
			.set(update)
			.where(filter)
			.returning({ updatedId: clubs.id })
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (res instanceof Error) return res;
		if (res.length === 0) return new ErrorWithCategory("Club not found", ErrorCategory.ResourceNotFound);
		return null;
	}

	async setCategories(clubId: string, categoryIds: number[]): Promise<ErrorOrNull> {
		try {
			await db.transaction(async (tx) => {
				await tx.delete(clubCategories).where(eq(clubCategories.clubId, clubId));
				if (categoryIds.length > 0) {
					await tx.insert(clubCategories).values(categoryIds.map((categoryId) => ({ clubId, categoryId })));
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

export const clubsRepository = new ClubsRepository();
