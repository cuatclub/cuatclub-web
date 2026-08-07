import { z, type ZodSchema } from "zod";
import { ClubOutputDTOSchema } from "@/server/api/modules/clubs/dto/club.dto";

export type GetClubByIdInputDTO = { id: string };

export const GetClubByIdInputDTOSchema: ZodSchema<GetClubByIdInputDTO> = z.object({
	id: z.string().uuid(),
});

export const GetClubByIdOutputDTOSchema = ClubOutputDTOSchema;
export type GetClubByIdOutputDTO = z.infer<typeof GetClubByIdOutputDTOSchema>;
