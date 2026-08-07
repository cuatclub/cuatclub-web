import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import type { GetClubByIdInputDTO, GetClubByIdOutputDTO } from "@/server/api/modules/clubs/dto";
import { notFound } from "@/server/errors";

export const getClubById = async (req: GetClubByIdInputDTO): Promise<GetClubByIdOutputDTO> => {
	const club = await clubsRepository.getById(req.id);
	if (!club) throw notFound(`Club not found (id: ${req.id})`);

	return club.toDTO();
};
