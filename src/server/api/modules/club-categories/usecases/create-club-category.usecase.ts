import { clubCategoriesRepository } from "@/server/api/modules/club-categories/club-categories.repository";
import type {
  CreateClubCategoryInputDTO,
  CreateClubCategoryOutputDTO,
} from "@/server/api/modules/club-categories/dto/create-club-category.dto";

export const createClubCategory = async (
  input: CreateClubCategoryInputDTO
): Promise<CreateClubCategoryOutputDTO> => {
  await clubCategoriesRepository.create({
    clubId: input.clubId,
    categoryId: input.categoryId,
  });

  return {
    clubId: input.clubId,
    categoryId: input.categoryId,
  };
};
