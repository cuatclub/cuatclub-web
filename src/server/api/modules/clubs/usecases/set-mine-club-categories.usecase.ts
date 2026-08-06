import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import { ErrorCategory, ErrorWithCategory, type ErrorOrNull } from "@/utils/error";

export const setMineClubCategories = async (userId: string, categoryIds: number[]): Promise<ErrorOrNull> => {
	const [existing, findError] = await clubsRepository.findByUserId(userId);
	if (findError) return findError;
	if (!existing) return new ErrorWithCategory("Club not found", ErrorCategory.ResourceNotFound);

	return clubsRepository.setCategories(existing.id, categoryIds);
};
