import type { GetClubDashboardProfileOutputDTO } from "@/server/api/modules/clubs/dto";
import { clubsRepository } from "@/server/api/modules/clubs/repositories/clubs.repository";
import { notFound, validationError } from "@/server/errors";

export const getClubDashboardProfile = async (
  currentUserId: string
): Promise<GetClubDashboardProfileOutputDTO> => {
  const club = await clubsRepository.getDetailByUserId(currentUserId);

  if (!club) throw notFound("Club profile not found");

  if (!club.isPubliclyVisible) {
    throw validationError("Club registration must be complete to manage its profile.");
  }

  return club.toDTO();
};
