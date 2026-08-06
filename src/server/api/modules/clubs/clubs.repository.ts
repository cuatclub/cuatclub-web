import type { SQL } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "@/server/db";
import { clubs } from "@/server/db/schema/clubs";
import { InternalServerError, type ErrorOrNull } from "@/server/errors";
import { Club, type ClubRow } from "@/server/api/modules/clubs/club.entity";
import type { CreateClubInputDTO } from "@/server/api/modules/clubs/dto";

export interface IClubsRepository {
	create(req: CreateClubInputDTO): Promise<[string | null, ErrorOrNull]>;
	getById(id: string): Promise<[Club | null, ErrorOrNull]>;
	getByFilter(filter?: SQL): Promise<[Club[], ErrorOrNull]>;
	updateById(id: string, update: Partial<ClubRow>): Promise<ErrorOrNull>;
	deleteById(id: string): Promise<ErrorOrNull>;
}

class ClubsRepository implements IClubsRepository {
	async create(req: CreateClubInputDTO): Promise<[string | null, ErrorOrNull]> {
		const id = randomUUID();
		const res = await db
			.insert(clubs)
			.values({ ...req, id })
			.returning({ id: clubs.id })
			.catch((e) => {
				console.log(e);
				return new InternalServerError(e);
			});

		if (res instanceof Error) return [null, res];
		return [res[0]?.id ?? null, null];
	}

	async getById(id: string): Promise<[Club | null, ErrorOrNull]> {
		return this.getOneByFilter(eq(clubs.id, id));
	}

	async getByFilter(filter?: SQL): Promise<[Club[], ErrorOrNull]> {
		const res = await db.query.clubs.findMany({ where: filter }).catch((e) => {
			console.log(e);
			return new InternalServerError(e);
		});

		if (res instanceof Error) return [[], res];
		return [Club.toEntities(res), null];
	}

	async updateById(id: string, update: Partial<ClubRow>): Promise<ErrorOrNull> {
		return this.updateByFilter(eq(clubs.id, id), update);
	}

	async deleteById(id: string): Promise<ErrorOrNull> {
		return this.deleteByFilter(eq(clubs.id, id));
	}

	// Returns [null, null] when nothing matches — that's a normal result,
	// not a repository error. The usecase decides whether that's a NotFoundError.
	private async getOneByFilter(filter: SQL): Promise<[Club | null, ErrorOrNull]> {
		const res = await db.query.clubs.findFirst({ where: filter }).catch((e) => {
			console.log(e);
			return new InternalServerError(e);
		});

		if (res instanceof Error) return [null, res];
		if (!res) return [null, null];
		return [Club.toEntity(res), null];
	}

	private async updateByFilter(filter: SQL, update: Partial<ClubRow>): Promise<ErrorOrNull> {
		const res = await db
			.update(clubs)
			.set(update)
			.where(filter)
			.returning({ updatedId: clubs.id })
			.catch((e) => {
				console.log(e);
				return new InternalServerError(e);
			});

		if (res instanceof Error) return res;
		return null;
	}

	private async deleteByFilter(filter: SQL): Promise<ErrorOrNull> {
		const res = await db
			.delete(clubs)
			.where(filter)
			.catch((e) => {
				console.log(e);
				return new InternalServerError(e);
			});

		if (res instanceof Error) return res;
		return null;
	}
}

export const clubsRepository = new ClubsRepository();
