import { eq } from "drizzle-orm";
import { clubs } from "@/server/db/clubs";
import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import type { GetClubByIdRequest, GetClubByIdResult } from "@/server/api/modules/clubs/dto/get-club-by-id.dto";
import type { ErrorOrNull } from "@/utils/error";

export const getClubById = async (req: GetClubByIdRequest): Promise<[GetClubByIdResult | null, ErrorOrNull]> => {
	return clubsRepository.getOneByFilter(eq(clubs.id, req.id));
};
