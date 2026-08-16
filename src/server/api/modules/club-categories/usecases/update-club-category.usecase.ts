import { clubCategoriesRepository } from "@/server/api/modules/club-categories/club-categories.repository";
import type {
  UpdateClubCategoryInputDTO,
  UpdateClubCategoryOutputDTO,
} from "@/server/api/modules/club-categories/dto/update-club-category.dto";

export const updateClubCategory = async (
  input: UpdateClubCategoryInputDTO
): Promise<UpdateClubCategoryOutputDTO> => {
  const targetClubId = input.nextClubId ?? input.currentClubId;
  const targetCategoryId = input.nextCategoryId ?? input.currentCategoryId;

  await clubCategoriesRepository.update(input.currentClubId, input.currentCategoryId, {
    clubId: targetClubId,
    categoryId: targetCategoryId,
  });

  return {
    clubId: targetClubId,
    categoryId: targetCategoryId,
  };
};
