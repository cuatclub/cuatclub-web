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

  if (count === 0 && categories === undefined && name === undefined && image === undefined) {
    throw validationError("Please provide at least one field to update.");
  }

  const userUpdateData: Partial<UpdateUserParams> = {};
  if (name !== undefined) {
    userUpdateData.name = name;
  }
  if (image !== undefined) {
    userUpdateData.image = image;
  }

  await unitOfWork.run(async (client) => {
    await usersRepository.updateById(club.userId, userUpdateData, client);
    await clubsRepository.updateById(
      id,
      { ...updateData, registrationStatus: "INFO_SUBMITTED" },
      client
    );

    if (categories) {
      await clubCategoriesRepository.createCategoryClubByClubId(id, categories, client);
    }
  });

  return SaveClubProfileRegistrationOutputDTOSchema.parse({
    registrationStatus: "INFO_SUBMITTED",
  });
};
