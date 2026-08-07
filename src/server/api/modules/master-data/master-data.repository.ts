import { db } from "@/server/db";
import type { faculties } from "@/server/db/schema/faculties";
import type { categories } from "@/server/db/schema/categories";
import { wrapRepoError } from "@/server/errors";

export type FacultyRow = typeof faculties.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;

export interface IMasterDataRepository {
	getAllFaculties(): Promise<FacultyRow[]>;
	getAllCategories(): Promise<CategoryRow[]>;
}

class MasterDataRepository implements IMasterDataRepository {
	async getAllFaculties(): Promise<FacultyRow[]> {
		return db.query.faculties.findMany().catch(wrapRepoError);
	}

	async getAllCategories(): Promise<CategoryRow[]> {
		return db.query.categories.findMany().catch(wrapRepoError);
	}
}

export const masterDataRepository = new MasterDataRepository();
