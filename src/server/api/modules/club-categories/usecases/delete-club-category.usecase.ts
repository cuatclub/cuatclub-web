import { clubCategoriesRepository } from "@/server/api/modules/club-categories/club-categories.repository";
import type {
  DeleteClubCategoryInputDTO,
  DeleteClubCategoryOutputDTO,
} from "@/server/api/modules/club-categories/dto/delete-club-category.dto";

export const deleteClubCategory = async (
  input: DeleteClubCategoryInputDTO
): Promise<DeleteClubCategoryOutputDTO> => {
  await clubCategoriesRepository.delete(input.clubId, input.categoryId);

  return {
    clubId: input.clubId,
    categoryId: input.categoryId,
  };
};
