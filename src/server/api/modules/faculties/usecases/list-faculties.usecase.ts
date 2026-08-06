import { facultiesRepository } from "@/server/api/modules/faculties/faculties.repository";
import type { Faculty } from "@/server/api/modules/faculties/dto";

export const listFaculties = async (): Promise<Faculty[]> => {
	const [faculties, error] = await facultiesRepository.findAll();
	if (error) throw error;

	return faculties;
};
