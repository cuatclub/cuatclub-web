import { clubsRepository } from "@/server/api/modules/clubs/repository/clubs.repository";
import type { GetClubByIdRequest, GetClubByIdResult } from "@/server/api/modules/clubs/dto/getClubById.dto";
import { ErrorCategory, ErrorWithCategory, type ErrorOrNull } from "@/utils/error";

export const getClubById = async (req: GetClubByIdRequest): Promise<[GetClubByIdResult | null, ErrorOrNull]> => {
	const [club, error] = await clubsRepository.findById(req.id);
	if (error) return [null, error];
	if (!club) return [null, new ErrorWithCategory("Club not found", ErrorCategory.ResourceNotFound)];
	return [club, null];
};
