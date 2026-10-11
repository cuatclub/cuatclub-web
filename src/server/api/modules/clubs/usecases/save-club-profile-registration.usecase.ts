import { clubsRepository } from "@/server/api/modules/clubs/repositories/clubs.repository";
import { usersRepository } from "@/server/api/modules/users/repositories/users.repository";
import {
  SaveClubProfileRegistrationOutputDTOSchema,
  type SaveClubProfileRegistrationInputDTO,
  type SaveClubProfileRegistrationOutputDTO,
} from "@/server/api/modules/clubs/dto";
import { notFound, validationError } from "@/server/errors";
import { unitOfWork } from "@/server/db/unit-of-work";
import { clubCategoriesRepository } from "@/server/api/modules/clubs/repositories/club-categories.repository";
import { deleteImagesWithinPrefix, isKeyDirectlyWithinPrefix, toR2Key } from "@/server/services/r2";

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

  if (!club.isAwaitingProfileInformation) {
    throw validationError("Club profile information cannot be changed at this step.");
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

  const retainedImageUrls = new Set([image, ...update.imageUrls]);
  const imagePrefix = `clubs/${club.id}/`;
  const removedImageUrls = [user.image, ...club.imageUrls].filter(
    (url): url is string =>
      url !== null &&
      !retainedImageUrls.has(url) &&
      isKeyDirectlyWithinPrefix(toR2Key(url), imagePrefix)
  );
  await deleteImagesWithinPrefix(removedImageUrls, imagePrefix);

  return SaveClubProfileRegistrationOutputDTOSchema.parse({
    registrationStatus: "INFO_SUBMITTED",
  });
};
