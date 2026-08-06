import { z, type ZodSchema } from "zod";
import type { ClubWithRelations } from "@/server/api/modules/clubs/entity/club.entity";

export type GetClubByIdRequest = { id: string };

export const GetClubByIdRequestSchema: ZodSchema<GetClubByIdRequest> = z.object({
	id: z.string().uuid(),
});

export type GetClubByIdResult = ClubWithRelations;
