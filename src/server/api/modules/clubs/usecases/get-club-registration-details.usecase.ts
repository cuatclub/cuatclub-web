import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import type { GetClubRegistrationDetailsOutputDTO } from "@/server/api/modules/clubs/dto";
import { notFound, validationError } from "@/server/errors";

export const getClubRegistrationDetails = async (
  currentUserId: string
): Promise<GetClubRegistrationDetailsOutputDTO> => {
  const club = await clubsRepository.getDetailByUserId(currentUserId);

  if (!club) throw notFound("Club profile not found");

  if (!club.isRegistrationInProgress) {
    throw validationError("Club registration is no longer in progress.");
  }

  return club.toDTO();
};
