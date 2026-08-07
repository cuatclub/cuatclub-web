import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import type { UpdateClubInputDTO, UpdateClubOutputDTO } from "@/server/api/modules/clubs/dto";
import { notFound, unauthorized } from "@/server/errors";

export const updateClub = async (req: UpdateClubInputDTO, currentUserId: string): Promise<UpdateClubOutputDTO> => {
	const { id, ...patch } = req;

	const club = await clubsRepository.getById(id);
	if (!club) throw notFound(`Club not found (id: ${id})`);

	if (club.userId !== currentUserId) {
		throw unauthorized("You can only update your own club");
	}

	await club.update(patch);

	return club.toDTO();
};
