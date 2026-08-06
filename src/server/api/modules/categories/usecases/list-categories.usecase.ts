import { categoriesRepository } from "@/server/api/modules/categories/categories.repository";
import type { Category } from "@/server/api/modules/categories/dto";

export const listCategories = async (): Promise<Category[]> => {
	const [categories, error] = await categoriesRepository.findAll();
	if (error) throw error;

	return categories;
};
