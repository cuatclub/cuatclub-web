import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import type { GetMineClubResult } from "@/server/api/modules/clubs/dto/get-mine-club.dto";
import type { ErrorOrNull } from "@/utils/error";

export const getMineClub = async (userId: string): Promise<[GetMineClubResult, ErrorOrNull]> => {
	return clubsRepository.findByUserId(userId);
};
