import { z, type ZodSchema } from "zod";

export type SetMineClubCategoriesRequest = { categoryIds: number[] };

export const SetMineClubCategoriesRequestSchema: ZodSchema<SetMineClubCategoriesRequest> = z.object({
	categoryIds: z.array(z.number().int()),
});
