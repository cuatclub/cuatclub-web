import {
  clubsRepository,
  type UpdateClubParams,
} from "@/server/api/modules/clubs/clubs.repository";
import type {
  SubmitClubProfileRegistrationInputDTO,
  SubmitClubProfileRegistrationOutputDTO,
} from "@/server/api/modules/clubs/dto/submit-club-profile-registration.dto";
import { notFound, validationError } from "@/server/errors";

export const submitProfileRegistration = async (
  input: SubmitClubProfileRegistrationInputDTO
): Promise<SubmitClubProfileRegistrationOutputDTO> => {
  const { id, ...update } = input;

  if (Object.keys(update).length === 0) {
    throw validationError("Please provide at least one field to update.");
  }

  let count = 0;
  const updateData: Partial<UpdateClubParams> = {};
  if ("affiliationId" in update && update.affiliationId !== undefined) {
    updateData.affiliationId = update.affiliationId;
    count++;
  }
  if ("shortDescription" in update && update.shortDescription !== undefined) {
    updateData.shortDescription = update.shortDescription;
    count++;
  }
  if ("longDescription" in update && update.longDescription !== undefined) {
    updateData.longDescription = update.longDescription;
    count++;
  }
  if ("imageUrls" in update && update.imageUrls !== undefined) {
    updateData.imageUrls = update.imageUrls;
    count++;
  }
  if ("contacts" in update && update.contacts !== undefined) {
    updateData.contacts = update.contacts;
    count++;
  }
  if ("registrationStatus" in update && update.registrationStatus !== undefined) {
    updateData.registrationStatus = update.registrationStatus;
    count++;
  }

  if (count === 0) {
    throw validationError("Please provide at least one field to update.");
  }

  await clubsRepository.updateById(id, updateData);

  const club = await clubsRepository.getById(id);
  if (!club) throw notFound("Club not found");

  return club.toDTO();
};
