import { z } from "zod";
import { ClubDetailOutputDTOSchema } from "@/server/api/modules/clubs/dto/club-detail.dto";

export type GetClubRegistrationDetailsInputDTO = Record<string, never>;
export const GetClubRegistrationDetailsInputDTOSchema = z.object({});

export const GetClubRegistrationDetailsOutputDTOSchema = ClubDetailOutputDTOSchema;
export type GetClubRegistrationDetailsOutputDTO = z.infer<
  typeof GetClubRegistrationDetailsOutputDTOSchema
>;
