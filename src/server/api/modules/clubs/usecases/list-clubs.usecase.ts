import { and, eq } from "drizzle-orm";
import { clubs } from "@/server/db/clubs";
import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import type { ListClubsRequest, ListClubsResult } from "@/server/api/modules/clubs/dto/list-clubs.dto";
import type { ErrorOrNull } from "@/utils/error";

/** Only surfaces `completed` clubs — pending/info_submitted are not yet public. */
export const listClubs = async (req: ListClubsRequest): Promise<[ListClubsResult, ErrorOrNull]> => {
	const conditions = [eq(clubs.registrationStatus, "completed")];
	if (req.facultyId !== undefined) conditions.push(eq(clubs.facultyId, req.facultyId));

	const [rows, error] = await clubsRepository.findMany(and(...conditions));
	if (error) return [[], error];

	if (req.categoryId === undefined) return [rows, null];
	// Small dataset assumption for v1 — filter in-app rather than joining club_categories in the query.
	return [rows.filter((club) => club.categories.some((c) => c.categoryId === req.categoryId)), null];
};
