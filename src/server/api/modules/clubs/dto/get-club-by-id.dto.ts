import { z } from "zod";
import { ClubDetailOutputDTOSchema } from "@/server/api/modules/clubs/dto/club-detail.dto";

export const GetClubByIdInputDTOSchema = z.object({ clubId: z.string().uuid() });

export type GetClubByIdInputDTO = z.infer<typeof GetClubByIdInputDTOSchema>;

export const GetClubByIdOutputDTOSchema = ClubDetailOutputDTOSchema;
export type GetClubByIdOutputDTO = z.infer<typeof GetClubByIdOutputDTOSchema>;
