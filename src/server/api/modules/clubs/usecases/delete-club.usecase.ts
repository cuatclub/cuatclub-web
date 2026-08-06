import { eq } from "drizzle-orm";
import { clubs } from "@/server/db/clubs";
import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import type { DeleteClubRequest } from "@/server/api/modules/clubs/dto/delete-club.dto";
import type { ErrorOrNull } from "@/utils/error";

export const deleteClub = async (req: DeleteClubRequest): Promise<ErrorOrNull> => {
	return clubsRepository.delete(eq(clubs.id, req.id));
};
