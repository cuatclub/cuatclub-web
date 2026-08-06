import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import type { CreateClubRequest } from "@/server/api/modules/clubs/dto/create-club.dto";
import type { ErrorOrNull } from "@/utils/error";

export const createClub = async (req: CreateClubRequest): Promise<[string | null, ErrorOrNull]> => {
	return clubsRepository.create(req);
};
