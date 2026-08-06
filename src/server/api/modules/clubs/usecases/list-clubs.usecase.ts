import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import type { ListClubsOutputDTO } from "@/server/api/modules/clubs/dto";

export const listClubs = async (): Promise<ListClubsOutputDTO> => {
	const [clubsList, error] = await clubsRepository.getByFilter();
	if (error) throw error;

	return clubsList.map((club) => club.toDTO());
};
