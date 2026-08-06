import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import type { GetClubByIdInputDTO, GetClubByIdOutputDTO } from "@/server/api/modules/clubs/dto";
import { NotFoundError } from "@/server/errors";

export const getClubById = async (req: GetClubByIdInputDTO): Promise<GetClubByIdOutputDTO> => {
	const [club, error] = await clubsRepository.getById(req.id);
	if (error) throw error;
	if (!club) throw new NotFoundError(`Club not found (id: ${req.id})`);

	return club.toDTO();
};
