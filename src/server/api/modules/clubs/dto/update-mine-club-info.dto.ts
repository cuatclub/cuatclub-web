import { z, type ZodSchema } from "zod";

export type UpdateMineClubInfoRequest = {
	name?: string;
	logoUrl?: string;
	facultyId?: number;
	shortDescription?: string;
	longDescription?: string;
	imageUrls?: string[];
	contacts?: {
		instagram?: string;
		facebook?: string;
		tiktok?: string;
		line_oa?: string;
	};
};

const ContactsSchema = z.object({
	instagram: z.string().optional(),
	facebook: z.string().optional(),
	tiktok: z.string().optional(),
	line_oa: z.string().optional(),
});

export const UpdateMineClubInfoRequestSchema: ZodSchema<UpdateMineClubInfoRequest> = z.object({
	name: z.string().min(1).optional(),
	logoUrl: z.string().min(1).optional(),
	facultyId: z.number().int().optional(),
	shortDescription: z.string().max(180).optional(),
	longDescription: z.string().min(1).optional(),
	imageUrls: z.array(z.string()).max(5).optional(),
	contacts: ContactsSchema.optional(),
});
