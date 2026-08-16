import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import type {
  GetCategoryByClubIdInputDTO,
  GetCategoryByClubIdOutputDTO,
} from "@/server/api/modules/clubs/dto/get-category-by-club-id.dto";

export const getCategoryByClubId = async (
  input: GetCategoryByClubIdInputDTO
): Promise<GetCategoryByClubIdOutputDTO> => {
  return clubsRepository.getCategoryByClubId(input.clubId);
};
