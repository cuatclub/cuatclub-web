import { masterDataRepository } from "@/server/api/modules/master-data/master-data.repository";
import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import type {
  DeleteAffiliationInputDTO,
  DeleteAffiliationOutputDTO,
} from "@/server/api/modules/master-data/dto";
import { conflict, notFound } from "@/server/errors";

export const deleteAffiliation = async (
  input: DeleteAffiliationInputDTO
): Promise<DeleteAffiliationOutputDTO> => {
  const affiliations = await masterDataRepository.getAllAffiliations();

  const current = affiliations.find((affiliation) => affiliation.id === input.id);
  if (!current) throw notFound("Affiliation not found");

  const isInUse = await clubsRepository.existsByAffiliationId(input.id);
  if (isInUse) throw conflict("This affiliation is still used by one or more clubs");

  await masterDataRepository.deleteAffiliation(input.id);

  return { success: true };
};
