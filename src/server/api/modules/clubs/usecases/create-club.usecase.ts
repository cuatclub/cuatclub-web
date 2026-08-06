import { Club } from "@/server/api/modules/clubs/club.entity";
import type { CreateClubInputDTO, CreateClubOutputDTO } from "@/server/api/modules/clubs/dto";
import { InternalServerError, UnauthorizedError } from "@/server/errors";

export const createClub = async (req: CreateClubInputDTO, currentUserId: string): Promise<CreateClubOutputDTO> => {
	if (req.userId !== currentUserId) {
		throw new UnauthorizedError("You can only create a club for yourself");
	}

	const [club, error] = await Club.create(req);
	if (error) throw error;
	if (!club) throw new InternalServerError("Club was created but could not be reloaded");

	return club.toDTO();
};
