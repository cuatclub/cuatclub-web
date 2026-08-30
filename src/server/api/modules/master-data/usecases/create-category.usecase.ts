import { masterDataRepository } from "@/server/api/modules/master-data/master-data.repository";
import type {
  CreateCategoryInputDTO,
  CreateCategoryOutputDTO,
} from "@/server/api/modules/master-data/dto";
import { conflict } from "@/server/errors";

export const createCategory = async (
  input: CreateCategoryInputDTO
): Promise<CreateCategoryOutputDTO> => {
  const categories = await masterDataRepository.getAllCategories();

  const duplicate = categories.find((category) => category.label === input.label);
  if (duplicate) throw conflict("A category with this label already exists");

  return masterDataRepository.createCategory({
    label: input.label,
    fontColor: input.fontColor,
    backgroundColor: input.backgroundColor,
  });
};
