import { Club } from "@/server/api/modules/clubs/club.entity";
import type { CreateClubInputDTO, CreateClubOutputDTO } from "@/server/api/modules/clubs/dto";
import { unauthorized } from "@/server/errors";

export const createClub = async (req: CreateClubInputDTO, currentUserId: string): Promise<CreateClubOutputDTO> => {
	if (req.userId !== currentUserId) {
		throw unauthorized("You can only create a club for yourself");
	}

	const club = await Club.create(req);
	return club.toDTO();
};
