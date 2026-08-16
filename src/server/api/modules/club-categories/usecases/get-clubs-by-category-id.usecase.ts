import { clubCategoriesRepository } from "@/server/api/modules/club-categories/club-categories.repository";
import type {
  GetClubsByCategoryIdInputDTO,
  GetClubsByCategoryIdOutputDTO,
} from "@/server/api/modules/club-categories/dto/get-clubs-by-category-id.dto";

export const getClubsByCategoryId = async (
  input: GetClubsByCategoryIdInputDTO
): Promise<GetClubsByCategoryIdOutputDTO> => {
  const clubs = await clubCategoriesRepository.getClubsByCategoryId(input.categoryId);

  return clubs.map((club) => club.toDTO());
};
