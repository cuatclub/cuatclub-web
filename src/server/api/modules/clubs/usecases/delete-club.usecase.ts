import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import type {
  DeleteClubInputDTO,
  DeleteClubOutputDTO,
} from "@/server/api/modules/clubs/dto/delete-club.dto";
import { notFound } from "@/server/errors";

export const deleteClub = async (input: DeleteClubInputDTO): Promise<DeleteClubOutputDTO> => {
  const club = await clubsRepository.getById(input.id);
  if (!club) throw notFound("Club not found");

  await clubsRepository.deleteById(input.id);

  return { id: input.id };
};
