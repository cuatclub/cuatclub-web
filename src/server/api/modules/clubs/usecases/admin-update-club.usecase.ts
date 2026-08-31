import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import { usersRepository } from "@/server/api/modules/users/users.repository";
import { clubCategoriesRepository } from "@/server/api/modules/clubs/club-categories.repository";
import { unitOfWork } from "@/server/db/unit-of-work";
import { notFound } from "@/server/errors";
import type {
  AdminUpdateClubInputDTO,
  AdminUpdateClubOutputDTO,
} from "@/server/api/modules/clubs/dto";

export const adminUpdateClub = async (
  input: AdminUpdateClubInputDTO
): Promise<AdminUpdateClubOutputDTO> => {
  const { id, categories, name, image, ...update } = input;

  const club = await clubsRepository.getById(id);
  if (!club) throw notFound("Club not found");

  await unitOfWork.run(async (client) => {
    await usersRepository.updateById(club.userId, { name, image }, client);
    await clubsRepository.updateById(id, update, client);
    await clubCategoriesRepository.createCategoryClubByClubId(id, categories, client);
  });

  const detail = await clubsRepository.getDetailById(id);
  if (!detail) throw notFound("Club not found");

  return detail.toDTO();
};
