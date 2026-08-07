import { masterDataRepository } from "@/server/api/modules/master-data/master-data.repository";
import type { GetAllCategoriesOutputDTO } from "@/server/api/modules/master-data/dto";

export const getAllCategories = async (): Promise<GetAllCategoriesOutputDTO> => {
	return masterDataRepository.getAllCategories();
};
