import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import type { ListClubsOutputDTO } from "@/server/api/modules/clubs/dto";

export const listClubs = async (): Promise<ListClubsOutputDTO> => {
	const clubsList = await clubsRepository.getByFilter();

	return clubsList.map((club) => club.toDTO());
};
