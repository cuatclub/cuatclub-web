import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import type {
  GetAllClubsAdminInputDTO,
  GetAllClubsAdminOutputDTO,
} from "@/server/api/modules/clubs/dto";

export const getAllClubsForAdmin = async (
  input: GetAllClubsAdminInputDTO
): Promise<GetAllClubsAdminOutputDTO> => {
  const { clubs, total } = await clubsRepository.getAllDetailByFilter(input);

  return {
    clubs: clubs.map((club) => ({
      id: club.id,
      name: club.name,
      email: club.email,
      logoUrl: club.logoUrl,
      shortDescription: club.shortDescription,
      affiliation: club.affiliation,
      categories: club.categories,
    })),
    total,
    page: input.page,
    pageSize: input.pageSize,
  };
};
