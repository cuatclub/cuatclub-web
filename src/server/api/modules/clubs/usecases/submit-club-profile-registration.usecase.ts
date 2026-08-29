import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import {
  SubmitClubProfileRegistrationOutputDTOSchema,
  type SubmitClubProfileRegistrationInputDTO,
  type SubmitClubProfileRegistrationOutputDTO,
} from "@/server/api/modules/clubs/dto";
import { validationError, notFound } from "@/server/errors";
import { usersRepository } from "@/server/api/modules/users/users.repository";
import { unitOfWork } from "@/server/db/unit-of-work";

export const submitClubProfileRegistration = async (
  userId: string,
  input: SubmitClubProfileRegistrationInputDTO
): Promise<SubmitClubProfileRegistrationOutputDTO> => {
  const { id } = input;

  const user = await usersRepository.getById(userId);
  if (!user) throw notFound("User not found");

  const club = await clubsRepository.getById(id);
  if (!club) throw notFound("Club not found");
  if (club.userId !== userId) {
    throw validationError("You are not the owner of this club.");
  }

  if (!club.isAwaitingRegistrationReview) {
    throw validationError("Club registration information must be submitted first.");
  }

  await unitOfWork.run(async (client) => {
    await clubsRepository.updateById(id, { registrationStatus: "COMPLETED" }, client);
  });

  return SubmitClubProfileRegistrationOutputDTOSchema.parse({
    registrationStatus: "COMPLETED",
  });
};
