import type { SQL } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "@/server/db";
import { clubs } from "@/server/db/clubs";
import { type ErrorOrNull, ErrorWithCategory, ErrorCategory, PostgreSQLError } from "@/utils/error";
import type { ClubRow } from "@/server/api/modules/clubs/entity/club.entity";
import type { CreateClubRequest } from "@/server/api/modules/clubs/dto/create-club.dto";

export interface IClubsRepository {
	create(req: CreateClubRequest): Promise<[string | null, ErrorOrNull]>;
	getByFilter(filter?: SQL): Promise<[ClubRow[], ErrorOrNull]>;
	getOneByFilter(filter: SQL): Promise<[ClubRow | null, ErrorOrNull]>;
	update(filter: SQL, update: Partial<ClubRow>): Promise<ErrorOrNull>;
	delete(filter: SQL): Promise<ErrorOrNull>;
}

class ClubsRepository implements IClubsRepository {
	async create(req: CreateClubRequest): Promise<[string | null, ErrorOrNull]> {
		const id = randomUUID();
		const res = await db
			.insert(clubs)
			.values({ ...req, id })
			.returning({ id: clubs.id })
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (res instanceof Error) return [null, res];
		return [res[0]?.id ?? null, null];
	}

	async getByFilter(filter?: SQL): Promise<[ClubRow[], ErrorOrNull]> {
		const res = await db.query.clubs.findMany({ where: filter }).catch((e) => {
			console.log(e);
			return new PostgreSQLError();
		});

		if (res instanceof Error) return [[], res];
		return [res, null];
	}

	async getOneByFilter(filter: SQL): Promise<[ClubRow | null, ErrorOrNull]> {
		const res = await db.query.clubs.findFirst({ where: filter }).catch((e) => {
			console.log(e);
			return new PostgreSQLError();
		});

		if (res instanceof Error) return [null, res];
		if (!res) return [null, new ErrorWithCategory("Club not found", ErrorCategory.ResourceNotFound)];
		return [res, null];
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

	async delete(filter: SQL): Promise<ErrorOrNull> {
		const res = await db
			.delete(clubs)
			.where(filter)
			.catch((e) => {
				console.log(e);
				return new PostgreSQLError();
			});

		if (res instanceof Error) return res;
		return null;
	}
}

export const clubsRepository = new ClubsRepository();
