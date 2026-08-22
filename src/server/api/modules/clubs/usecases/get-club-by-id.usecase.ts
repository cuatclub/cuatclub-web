import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import type { GetClubByIdInputDTO, GetClubByIdOutputDTO } from "@/server/api/modules/clubs/dto";
import { notFound } from "@/server/errors";

export const getClubById = async (input: GetClubByIdInputDTO): Promise<GetClubByIdOutputDTO> => {
  const club = await clubsRepository.getDetailById(input.clubId);

  if (!club?.isPubliclyVisible) throw notFound("Club not found");

  return club.toDTO();
};
