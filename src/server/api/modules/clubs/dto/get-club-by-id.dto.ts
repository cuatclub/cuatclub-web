import { z, type ZodSchema } from "zod";
import { ClubOutputDTOSchema, type ClubOutputDTO } from "@/server/api/modules/clubs/dto/club.dto";

export type GetClubByIdInputDTO = { id: string };

export const GetClubByIdInputDTOSchema: ZodSchema<GetClubByIdInputDTO> = z.object({
	id: z.string().uuid(),
});

export type GetClubByIdOutputDTO = ClubOutputDTO;

export const GetClubByIdOutputDTOSchema = ClubOutputDTOSchema;
