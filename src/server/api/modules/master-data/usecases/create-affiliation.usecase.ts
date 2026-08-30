import { masterDataRepository } from "@/server/api/modules/master-data/master-data.repository";
import type {
  CreateAffiliationInputDTO,
  CreateAffiliationOutputDTO,
} from "@/server/api/modules/master-data/dto";
import { conflict } from "@/server/errors";

export const createAffiliation = async (
  input: CreateAffiliationInputDTO
): Promise<CreateAffiliationOutputDTO> => {
  const affiliations = await masterDataRepository.getAllAffiliations();

  const duplicate = affiliations.find((affiliation) => affiliation.label === input.label);
  if (duplicate) throw conflict("An affiliation with this label already exists");

  return masterDataRepository.createAffiliation({ label: input.label });
};
