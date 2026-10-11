import { clubsRepository } from "@/server/api/modules/clubs/repositories/clubs.repository";
import { usersRepository } from "@/server/api/modules/users/repositories/users.repository";
import { clubCategoriesRepository } from "@/server/api/modules/clubs/repositories/club-categories.repository";
import { unitOfWork } from "@/server/db/unit-of-work";
import { notFound } from "@/server/errors";
import type {
  AdminUpdateClubInputDTO,
  AdminUpdateClubOutputDTO,
} from "@/server/api/modules/clubs/dto";
import { deleteImagesWithinPrefix, isKeyDirectlyWithinPrefix, toR2Key } from "@/server/services/r2";

export const adminUpdateClub = async (
  input: AdminUpdateClubInputDTO
): Promise<AdminUpdateClubOutputDTO> => {
  const { id, categories, name, image, ...update } = input;

  const club = await clubsRepository.getById(id);
  if (!club) throw notFound("Club not found");

  const user = await usersRepository.getById(club.userId);
  if (!user) throw notFound("User not found");

  await unitOfWork.run(async (client) => {
    await usersRepository.updateById(club.userId, { name, image }, client);
    await clubsRepository.updateById(id, update, client);
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

  const detail = await clubsRepository.getDetailById(id);
  if (!detail) throw notFound("Club not found");

  return detail.toDTO();
};
