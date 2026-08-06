import { eq } from "drizzle-orm";
import { clubs } from "@/server/db/clubs";
import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import type { UpdateClubRequest } from "@/server/api/modules/clubs/dto/update-club.dto";
import type { ErrorOrNull } from "@/utils/error";

export const updateClub = async (req: UpdateClubRequest): Promise<ErrorOrNull> => {
	const { id, ...rest } = req;
	return clubsRepository.update(eq(clubs.id, id), rest);
};
