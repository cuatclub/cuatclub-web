import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import type { GetClubRegistrationReviewOutputDTO } from "@/server/api/modules/clubs/dto";
import { notFound, validationError } from "@/server/errors";

export const getClubRegistrationReview = async (
  currentUserId: string
): Promise<GetClubRegistrationReviewOutputDTO> => {
  const club = await clubsRepository.getDetailByUserId(currentUserId);

  if (!club) throw notFound("Club profile not found");

  if (!club.isAwaitingRegistrationReview) {
    throw validationError("Club registration is not awaiting review.");
  }

  return club.toDTO();
};
