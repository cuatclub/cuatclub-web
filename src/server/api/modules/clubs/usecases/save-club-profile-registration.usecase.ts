import {
  clubsRepository,
  type UpdateClubParams,
} from "@/server/api/modules/clubs/clubs.repository";
import {
  usersRepository,
  type UpdateUserParams,
} from "@/server/api/modules/users/users.repository";
import {
  SaveClubProfileRegistrationOutputDTOSchema,
  type SaveClubProfileRegistrationInputDTO,
  type SaveClubProfileRegistrationOutputDTO,
} from "@/server/api/modules/clubs/dto/save-club-profile-registration.dto";
import { notFound, validationError } from "@/server/errors";
import { unitOfWork } from "@/server/db/unit-of-work";
import { clubCategoriesRepository } from "../club-categories.repository";

export const saveProfileRegistration = async (
  userId: string,
  input: SaveClubProfileRegistrationInputDTO
): Promise<SaveClubProfileRegistrationOutputDTO> => {
  const { id, categories, name, image, ...update } = input;

  const user = await usersRepository.getById(userId);
  if (!user) throw notFound("User not found");

  const club = await clubsRepository.getById(id);
  if (!club) throw notFound("Club not found");

  if (club.userId !== userId) {
    throw validationError("You are not the owner of this club.");
  }

  await unitOfWork.run(async (client) => {
    await usersRepository.updateById(club.userId, { name, image }, client);
    await clubsRepository.updateById(
      id,
      { ...update, registrationStatus: "INFO_SUBMITTED" },
      client
    );

    await clubCategoriesRepository.createCategoryClubByClubId(id, categories, client);
  });

  return SaveClubProfileRegistrationOutputDTOSchema.parse({
    registrationStatus: "INFO_SUBMITTED",
  });
};
