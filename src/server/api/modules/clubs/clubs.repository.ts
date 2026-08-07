import type { SQL } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "@/server/db";
import { clubs } from "@/server/db/schema/clubs";
import { wrapRepoError } from "@/server/errors";
import { Club, type ClubRow } from "@/server/api/modules/clubs/club.entity";
import type { CreateClubInputDTO } from "@/server/api/modules/clubs/dto";

export interface IClubsRepository {
	create(req: CreateClubInputDTO): Promise<string>;
	getById(id: string): Promise<Club | null>;
	getByFilter(filter?: SQL): Promise<Club[]>;
	updateById(id: string, update: Partial<ClubRow>): Promise<void>;
	deleteById(id: string): Promise<void>;
}

class ClubsRepository implements IClubsRepository {
	async create(req: CreateClubInputDTO): Promise<string> {
		const id = randomUUID();
		const res = await db
			.insert(clubs)
			.values({ ...req, id })
			.returning({ id: clubs.id })
			.catch(wrapRepoError);

		return res[0]!.id;
	}

	async getById(id: string): Promise<Club | null> {
		return this.getOneByFilter(eq(clubs.id, id));
	}

	async getByFilter(filter?: SQL): Promise<Club[]> {
		const res = await db.query.clubs.findMany({ where: filter }).catch(wrapRepoError);

		return Club.toEntities(res);
	}

	async updateById(id: string, update: Partial<ClubRow>): Promise<void> {
		return this.updateByFilter(eq(clubs.id, id), update);
	}

	async deleteById(id: string): Promise<void> {
		return this.deleteByFilter(eq(clubs.id, id));
	}

	// Returns null when nothing matches — that's a normal result, not a
	// repository error. The usecase decides whether that's a not-found error.
	private async getOneByFilter(filter: SQL): Promise<Club | null> {
		const res = await db.query.clubs.findFirst({ where: filter }).catch(wrapRepoError);

		return res ? Club.toEntity(res) : null;
	}

	private async updateByFilter(filter: SQL, update: Partial<ClubRow>): Promise<void> {
		await db
			.update(clubs)
			.set(update)
			.where(filter)
			.catch(wrapRepoError);
	}

	private async deleteByFilter(filter: SQL): Promise<void> {
		await db
			.delete(clubs)
			.where(filter)
			.catch(wrapRepoError);
	}
}

export const clubsRepository = new ClubsRepository();
