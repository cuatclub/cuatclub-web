import { masterDataRepository } from "@/server/api/modules/master-data/master-data.repository";
import type { GetAllActivityTypesOutputDTO } from "@/server/api/modules/master-data/dto";

export const getAllActivityTypes = async (): Promise<GetAllActivityTypesOutputDTO> => {
  return masterDataRepository.getAllActivityTypes();
};
