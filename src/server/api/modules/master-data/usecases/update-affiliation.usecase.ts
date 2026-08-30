import { masterDataRepository } from "@/server/api/modules/master-data/master-data.repository";
import type {
  UpdateAffiliationInputDTO,
  UpdateAffiliationOutputDTO,
} from "@/server/api/modules/master-data/dto";
import { conflict, notFound } from "@/server/errors";

export const updateAffiliation = async (
  input: UpdateAffiliationInputDTO
): Promise<UpdateAffiliationOutputDTO> => {
  const affiliations = await masterDataRepository.getAllAffiliations();

  const current = affiliations.find((affiliation) => affiliation.id === input.id);
  if (!current) throw notFound("Affiliation not found");

  const duplicate = affiliations.find(
    (affiliation) => affiliation.id !== input.id && affiliation.label === input.label
  );
  if (duplicate) throw conflict("An affiliation with this label already exists");

  const updated = await masterDataRepository.updateAffiliation(input.id, { label: input.label });
  if (!updated) throw notFound("Affiliation not found");

  return updated;
};
