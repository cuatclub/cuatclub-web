import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import {
  SubmitClubProfileRegistrationOutputDTOSchema,
  type SubmitClubProfileRegistrationInputDTO,
  type SubmitClubProfileRegistrationOutputDTO,
} from "@/server/api/modules/clubs/dto/submit-club-profile-registration.dto";
import { notFound } from "@/server/errors";

export const submitClubProfileRegistration = async (
  input: SubmitClubProfileRegistrationInputDTO
): Promise<SubmitClubProfileRegistrationOutputDTO> => {
  const { id } = input;

  const club = await clubsRepository.getById(id);
  if (!club) throw notFound("Club not found");

  await clubsRepository.updateById(id, { registrationStatus: "COMPLETED" });
  return SubmitClubProfileRegistrationOutputDTOSchema.parse({
    registrationStatus: "COMPLETED",
  });
};
