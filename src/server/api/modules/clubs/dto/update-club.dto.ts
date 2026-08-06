import { z, type ZodSchema } from "zod";
import type { clubs } from "@/server/db/schema/clubs";
import { ClubOutputDTOSchema, type ClubOutputDTO } from "@/server/api/modules/clubs/dto/club.dto";

export type UpdateClubInputDTO = {
	id: string;
} & Partial<Omit<typeof clubs.$inferInsert, "id" | "userId" | "createdAt" | "updatedAt">>;

const ContactsSchema = z.object({
	instagram: z.string().optional(),
	facebook: z.string().optional(),
	tiktok: z.string().optional(),
	line_oa: z.string().optional(),
});

export const UpdateClubInputDTOSchema: ZodSchema<UpdateClubInputDTO> = z.object({
	id: z.string().uuid(),
	email: z.string().email().optional(),
	registrationStatus: z.enum(["PENDING", "INFO_SUBMITTED", "COMPLETED"]).optional(),
	name: z.string().min(1).nullable().optional(),
	logoUrl: z.string().min(1).nullable().optional(),
	facultyId: z.number().int().nullable().optional(),
	shortDescription: z.string().max(180).nullable().optional(),
	longDescription: z.string().nullable().optional(),
	imageUrls: z.array(z.string()).max(5).optional(),
	contacts: ContactsSchema.nullable().optional(),
});

export type UpdateClubOutputDTO = ClubOutputDTO;

export const UpdateClubOutputDTOSchema = ClubOutputDTOSchema;
