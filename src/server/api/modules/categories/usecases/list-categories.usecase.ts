import { categoriesRepository } from "@/server/api/modules/categories/categories.repository";
import type { Category } from "@/server/api/modules/categories/dto/list-categories.dto";
import type { ErrorOrNull } from "@/server/error";

export const listCategories = async (): Promise<[Category[], ErrorOrNull]> => {
	return categoriesRepository.findAll();
};
