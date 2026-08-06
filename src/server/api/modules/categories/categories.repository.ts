import { db } from "@/server/db";
import { type ErrorOrNull, PostgreSQLError } from "@/server/error";
import type { Category } from "@/server/api/modules/categories/dto/list-categories.dto";

export interface ICategoriesRepository {
	findAll(): Promise<[Category[], ErrorOrNull]>;
}

class CategoriesRepository implements ICategoriesRepository {
	async findAll(): Promise<[Category[], ErrorOrNull]> {
		const res = await db.query.categories.findMany().catch((e) => {
			console.log(e);
			return new PostgreSQLError();
		});

		if (res instanceof Error) return [[], res];
		return [res, null];
	}
}

export const categoriesRepository = new CategoriesRepository();
