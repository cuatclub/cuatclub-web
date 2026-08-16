import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import type { GetClubByIdOutputDTO } from "@/server/api/modules/clubs/dto";
import { notFound } from "@/server/errors";

export const getClubById = async (clubId: string): Promise<GetClubByIdOutputDTO> => {
  const club = await clubsRepository.getDetailById(clubId);
  if (!club?.isPubliclyVisible) throw notFound("Club not found");

  return club.toDTO();
};
