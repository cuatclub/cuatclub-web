import { db } from "@/server/db";
import { type ErrorOrNull, PostgreSQLError } from "@/server/error";
import type { Faculty } from "@/server/api/modules/faculties/dto/list-faculties.dto";

export interface IFacultiesRepository {
	findAll(): Promise<[Faculty[], ErrorOrNull]>;
}

class FacultiesRepository implements IFacultiesRepository {
	async findAll(): Promise<[Faculty[], ErrorOrNull]> {
		const res = await db.query.faculties.findMany().catch((e) => {
			console.log(e);
			return new PostgreSQLError();
		});

		if (res instanceof Error) return [[], res];
		return [res, null];
	}
}

export const facultiesRepository = new FacultiesRepository();
