import { z } from "zod";
import { ClubDetailOutputDTOSchema } from "@/server/api/modules/clubs/dto/club-detail.dto";

export type GetClubDashboardProfileInputDTO = Record<string, never>;
export const GetClubDashboardProfileInputDTOSchema = z.object({});

export const GetClubDashboardProfileOutputDTOSchema = ClubDetailOutputDTOSchema;
export type GetClubDashboardProfileOutputDTO = z.infer<
  typeof GetClubDashboardProfileOutputDTOSchema
>;
