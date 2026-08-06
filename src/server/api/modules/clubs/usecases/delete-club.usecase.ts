import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import type { DeleteClubInputDTO, DeleteClubOutputDTO } from "@/server/api/modules/clubs/dto";
import { NotFoundError, UnauthorizedError } from "@/server/errors";

export const deleteClub = async (req: DeleteClubInputDTO, currentUserId: string): Promise<DeleteClubOutputDTO> => {
	const [club, findError] = await clubsRepository.getById(req.id);
	if (findError) throw findError;
	if (!club) throw new NotFoundError(`Club not found (id: ${req.id})`);

	if (club.userId !== currentUserId) {
		throw new UnauthorizedError("You can only delete your own club");
	}

	const deleteError = await club.delete();
	if (deleteError) throw deleteError;

	return { id: club.id };
};
