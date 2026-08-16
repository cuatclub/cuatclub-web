import { z } from "zod";
import { ClubOutputDTOSchema } from "@/server/api/modules/clubs/dto";

export const GetClubsByCategoryIdInputDTOSchema = z.object({
  categoryId: z.number().int().min(1),
});

export type GetClubsByCategoryIdInputDTO = z.infer<typeof GetClubsByCategoryIdInputDTOSchema>;

export const GetClubsByCategoryIdOutputDTOSchema = z.array(ClubOutputDTOSchema);

export type GetClubsByCategoryIdOutputDTO = z.infer<typeof GetClubsByCategoryIdOutputDTOSchema>;
