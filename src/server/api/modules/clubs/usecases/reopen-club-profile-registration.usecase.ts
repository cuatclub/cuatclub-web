import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import {
  ReopenClubProfileRegistrationOutputDTOSchema,
  type ReopenClubProfileRegistrationOutputDTO,
} from "@/server/api/modules/clubs/dto";
import { notFound, validationError } from "@/server/errors";

export const reopenClubProfileRegistration = async (
  currentUserId: string
): Promise<ReopenClubProfileRegistrationOutputDTO> => {
  const club = await clubsRepository.getByUserId(currentUserId);

  if (!club) throw notFound("Club profile not found");

  if (!club.isAwaitingRegistrationReview) {
    throw validationError("Club registration is not awaiting review.");
  }

  await clubsRepository.updateById(club.id, { registrationStatus: "PENDING" });

  return ReopenClubProfileRegistrationOutputDTOSchema.parse({
    registrationStatus: "PENDING",
  });
};
