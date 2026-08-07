import { masterDataRepository } from "@/server/api/modules/master-data/master-data.repository";
import type { GetAllFacultiesOutputDTO } from "@/server/api/modules/master-data/dto";

export const getAllFaculties = async (): Promise<GetAllFacultiesOutputDTO> => {
	return masterDataRepository.getAllFaculties();
};
