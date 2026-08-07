import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import type { DeleteClubInputDTO, DeleteClubOutputDTO } from "@/server/api/modules/clubs/dto";
import { notFound, unauthorized } from "@/server/errors";

export const deleteClub = async (req: DeleteClubInputDTO, currentUserId: string): Promise<DeleteClubOutputDTO> => {
	const club = await clubsRepository.getById(req.id);
	if (!club) throw notFound(`Club not found (id: ${req.id})`);

	if (club.userId !== currentUserId) {
		throw unauthorized("You can only delete your own club");
	}

	await club.delete();

	return { id: club.id };
};
