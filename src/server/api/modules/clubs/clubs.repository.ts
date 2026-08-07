import type { SQL } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db, type DbClient } from "@/server/db";
import { clubs } from "@/server/db/schema/clubs";
import { wrapRepoError } from "@/server/errors";
import { Club, type ClubRow, type CreateClubParams } from "@/server/api/modules/clubs/club.entity";

export interface IClubsRepository {
	create(req: CreateClubParams, client?: DbClient): Promise<string>;
	getById(id: string): Promise<Club | null>;
	getByUserId(userId: string): Promise<Club | null>;
	getByFilter(filter?: SQL): Promise<Club[]>;
	updateById(id: string, update: Partial<ClubRow>, client?: DbClient): Promise<void>;
	deleteById(id: string, client?: DbClient): Promise<void>;
}

class ClubsRepository implements IClubsRepository {
	// `client` defaults to the module-level `db` so callers only need to pass
	// one explicitly when running inside unitOfWork.run() (see db/unit-of-work.ts).
	async create(req: CreateClubParams, client: DbClient = db): Promise<string> {
		const id = randomUUID();
		const res = await client
			.insert(clubs)
			.values({ ...req, id })
			.returning({ id: clubs.id })
			.catch(wrapRepoError);

		return res[0]!.id;
	}

	async getById(id: string): Promise<Club | null> {
		return this.getOneByFilter(eq(clubs.id, id));
	}

	async getByUserId(userId: string): Promise<Club | null> {
		return this.getOneByFilter(eq(clubs.userId, userId));
	}

	async getByFilter(filter?: SQL): Promise<Club[]> {
		const res = await db.query.clubs.findMany({ where: filter }).catch(wrapRepoError);

		return Club.toEntities(res);
	}

	async updateById(id: string, update: Partial<ClubRow>, client: DbClient = db): Promise<void> {
		return this.updateByFilter(eq(clubs.id, id), update, client);
	}

	async deleteById(id: string, client: DbClient = db): Promise<void> {
		return this.deleteByFilter(eq(clubs.id, id), client);
	}

	// Returns null when nothing matches — that's a normal result, not a
	// repository error. The usecase decides whether that's a not-found error.
	private async getOneByFilter(filter: SQL): Promise<Club | null> {
		const res = await db.query.clubs.findFirst({ where: filter }).catch(wrapRepoError);

		return res ? Club.toEntity(res) : null;
	}

	private async updateByFilter(filter: SQL, update: Partial<ClubRow>, client: DbClient): Promise<void> {
		await client
			.update(clubs)
			.set(update)
			.where(filter)
			.catch(wrapRepoError);
	}

	private async deleteByFilter(filter: SQL, client: DbClient): Promise<void> {
		await client
			.delete(clubs)
			.where(filter)
			.catch(wrapRepoError);
	}
}

export const clubsRepository = new ClubsRepository();
