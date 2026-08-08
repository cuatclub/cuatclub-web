import { masterDataRepository } from "@/server/api/modules/master-data/master-data.repository";
import type { GetAllAffiliationsOutputDTO } from "@/server/api/modules/master-data/dto";

export const getAllAffiliations = async (): Promise<GetAllAffiliationsOutputDTO> => {
  return masterDataRepository.getAllAffiliations();
};
