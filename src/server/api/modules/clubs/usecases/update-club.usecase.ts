import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import type { UpdateClubInputDTO, UpdateClubOutputDTO } from "@/server/api/modules/clubs/dto";
import { NotFoundError, UnauthorizedError } from "@/server/errors";

export const updateClub = async (req: UpdateClubInputDTO, currentUserId: string): Promise<UpdateClubOutputDTO> => {
	const { id, ...patch } = req;

	const [club, findError] = await clubsRepository.getById(id);
	if (findError) throw findError;
	if (!club) throw new NotFoundError(`Club not found (id: ${id})`);

	if (club.userId !== currentUserId) {
		throw new UnauthorizedError("You can only update your own club");
	}

	const updateError = await club.update(patch);
	if (updateError) throw updateError;

	return club.toDTO();
};
