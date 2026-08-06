import { z, type ZodSchema } from "zod";
import type { ClubWithRelations } from "@/server/api/modules/clubs/entity/club.entity";

export type ListClubsRequest = {
	facultyId?: number;
	categoryId?: number;
};

export const ListClubsRequestSchema: ZodSchema<ListClubsRequest> = z.object({
	facultyId: z.number().int().optional(),
	categoryId: z.number().int().optional(),
});

export type ListClubsResult = ClubWithRelations[];
