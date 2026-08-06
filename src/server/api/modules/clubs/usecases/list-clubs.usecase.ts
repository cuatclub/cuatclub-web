import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import type { ListClubsResult } from "@/server/api/modules/clubs/dto/list-clubs.dto";
import type { ErrorOrNull } from "@/utils/error";

export const listClubs = async (): Promise<[ListClubsResult, ErrorOrNull]> => {
	return clubsRepository.getByFilter();
};
