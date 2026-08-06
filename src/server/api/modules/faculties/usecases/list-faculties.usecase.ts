import { facultiesRepository } from "@/server/api/modules/faculties/repository/faculties.repository";
import type { Faculty } from "@/server/api/modules/faculties/dto/list-faculties.dto";
import type { ErrorOrNull } from "@/utils/error";

export const listFaculties = async (): Promise<[Faculty[], ErrorOrNull]> => {
	return facultiesRepository.findAll();
};
