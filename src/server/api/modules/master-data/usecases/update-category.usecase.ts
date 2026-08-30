import { masterDataRepository } from "@/server/api/modules/master-data/master-data.repository";
import type {
  UpdateCategoryInputDTO,
  UpdateCategoryOutputDTO,
} from "@/server/api/modules/master-data/dto";
import { conflict, notFound } from "@/server/errors";

export const updateCategory = async (
  input: UpdateCategoryInputDTO
): Promise<UpdateCategoryOutputDTO> => {
  const categories = await masterDataRepository.getAllCategories();

  const current = categories.find((category) => category.id === input.id);
  if (!current) throw notFound("Category not found");

  const duplicate = categories.find(
    (category) => category.id !== input.id && category.label === input.label
  );
  if (duplicate) throw conflict("A category with this label already exists");

  const updated = await masterDataRepository.updateCategory(input.id, {
    label: input.label,
    fontColor: input.fontColor,
    backgroundColor: input.backgroundColor,
  });
  if (!updated) throw notFound("Category not found");

  return updated;
};
