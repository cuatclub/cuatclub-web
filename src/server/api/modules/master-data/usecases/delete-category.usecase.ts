import { masterDataRepository } from "@/server/api/modules/master-data/master-data.repository";
import { clubCategoriesRepository } from "@/server/api/modules/clubs/club-categories.repository";
import type {
  DeleteCategoryInputDTO,
  DeleteCategoryOutputDTO,
} from "@/server/api/modules/master-data/dto";
import { conflict, notFound } from "@/server/errors";

export const deleteCategory = async (
  input: DeleteCategoryInputDTO
): Promise<DeleteCategoryOutputDTO> => {
  const categories = await masterDataRepository.getAllCategories();

  const current = categories.find((category) => category.id === input.id);
  if (!current) throw notFound("Category not found");

  const isInUse = await clubCategoriesRepository.existsByCategoryId(input.id);
  if (isInUse) throw conflict("This category is still used by one or more clubs");

  await masterDataRepository.deleteCategory(input.id);

  return { success: true };
};
