import { eq } from "drizzle-orm";
import { clubs } from "@/server/db/clubs";
import { clubsRepository } from "@/server/api/modules/clubs/repository/clubs.repository";
import type { UpdateMineClubInfoRequest } from "@/server/api/modules/clubs/dto/update-mine-club-info.dto";
import { ErrorCategory, ErrorWithCategory, type ErrorOrNull } from "@/utils/error";

export const updateMineClubInfo = async (userId: string, input: UpdateMineClubInfoRequest): Promise<ErrorOrNull> => {
	const [existing, findError] = await clubsRepository.findByUserId(userId);
	if (findError) return findError;
	if (!existing) return new ErrorWithCategory("Club not found", ErrorCategory.ResourceNotFound);

	const updateError = await clubsRepository.update(eq(clubs.id, existing.id), input);
	if (updateError) return updateError;

	// TODO: registration_status transition (pending -> info_submitted -> completed) is intentionally
	// left unimplemented here — use Club.isInfoComplete() from entity/club.entity.ts plus
	// clubsRepository.update(...) once the transition rules are decided.

	return null;
};
