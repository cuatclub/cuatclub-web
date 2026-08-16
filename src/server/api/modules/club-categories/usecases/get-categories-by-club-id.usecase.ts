import { clubCategoriesRepository } from "@/server/api/modules/club-categories/club-categories.repository";
import type {
  GetCategoriesByClubIdInputDTO,
  GetCategoriesByClubIdOutputDTO,
} from "@/server/api/modules/club-categories/dto/get-categories-by-club-id.dto";

export const getCategoriesByClubId = async (
  input: GetCategoriesByClubIdInputDTO
): Promise<GetCategoriesByClubIdOutputDTO> => {
  return clubCategoriesRepository.getCategoriesByClubId(input.clubId);
};
