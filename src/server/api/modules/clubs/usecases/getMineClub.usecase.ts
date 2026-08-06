import { clubsRepository } from "@/server/api/modules/clubs/repository/clubs.repository";
import type { GetMineClubResult } from "@/server/api/modules/clubs/dto/getMineClub.dto";
import type { ErrorOrNull } from "@/utils/error";

export const getMineClub = async (userId: string): Promise<[GetMineClubResult, ErrorOrNull]> => {
	return clubsRepository.findByUserId(userId);
};
