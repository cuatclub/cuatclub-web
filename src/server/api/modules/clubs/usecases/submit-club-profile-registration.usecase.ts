import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import type {
  SubmitClubProfileRegistrationInputDTO,
  SubmitClubProfileRegistrationOutputDTO,
} from "@/server/api/modules/clubs/dto/submit-club-profile-registration.dto";
import { notFound, validationError } from "@/server/errors";

export const submitProfileRegistration = async (
  input: SubmitClubProfileRegistrationInputDTO
): Promise<SubmitClubProfileRegistrationOutputDTO> => {
  const { id, ...update } = input;

  if (
    !update.affiliationId &&
    !update.shortDescription &&
    !update.longDescription &&
    !update.imageUrls &&
    !update.contacts &&
    !update.registrationStatus
  ) {
    throw validationError("Please provide at least one field to update.");
  }

  await clubsRepository.updateById(id, {
    affiliationId: update.affiliationId ?? undefined,
    shortDescription: update.shortDescription ?? undefined,
    longDescription: update.longDescription ?? undefined,
    imageUrls: update.imageUrls ?? undefined,
    contacts: update.contacts ?? undefined,
    registrationStatus: update.registrationStatus ?? undefined,
  });

  const club = await clubsRepository.getById(id);
  if (!club) throw notFound("Club not found");

  return club.toDTO();
};
