import { db } from "@/server/db";
import { InternalServerError, type ErrorOrNull } from "@/server/errors";
import type { Faculty } from "@/server/api/modules/faculties/dto";

export interface IFacultiesRepository {
	findAll(): Promise<[Faculty[], ErrorOrNull]>;
}

class FacultiesRepository implements IFacultiesRepository {
	async findAll(): Promise<[Faculty[], ErrorOrNull]> {
		const res = await db.query.faculties.findMany().catch((e) => {
			console.log(e);
			return new InternalServerError(e);
		});

		if (res instanceof Error) return [[], res];
		return [res, null];
	}
}

export const facultiesRepository = new FacultiesRepository();
