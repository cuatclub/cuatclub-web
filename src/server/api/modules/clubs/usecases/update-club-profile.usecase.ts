import {
  UpdateClubProfileOutputDTOSchema,
  type UpdateClubProfileInputDTO,
  type UpdateClubProfileOutputDTO,
} from "@/server/api/modules/clubs/dto";
import { clubCategoriesRepository } from "@/server/api/modules/clubs/repositories/club-categories.repository";
import { clubsRepository } from "@/server/api/modules/clubs/repositories/clubs.repository";
import { usersRepository } from "@/server/api/modules/users/repositories/users.repository";
import { unitOfWork } from "@/server/db/unit-of-work";
import { notFound, validationError } from "@/server/errors";

export const updateClubProfile = async (
  currentUserId: string,
  input: UpdateClubProfileInputDTO
): Promise<UpdateClubProfileOutputDTO> => {
  const club = await clubsRepository.getByUserId(currentUserId);
  if (!club) throw notFound("Club not found");

  if (!club.isPubliclyVisible) {
    throw validationError("Club registration must be complete to manage its profile.");
  }

  const user = await usersRepository.getById(currentUserId);
  if (!user) throw notFound("User not found");

  const { categories, name, image, ...update } = input;

  await unitOfWork.run(async (client) => {
    await usersRepository.updateById(currentUserId, { name, image }, client);
    await clubsRepository.updateById(club.id, update, client);
    await clubCategoriesRepository.createCategoryClubByClubId(club.id, categories, client);
  });

  const detail = await clubsRepository.getDetailByUserId(currentUserId);
  if (!detail) throw notFound("Club profile not found");

  return UpdateClubProfileOutputDTOSchema.parse(detail.toDTO());
};
