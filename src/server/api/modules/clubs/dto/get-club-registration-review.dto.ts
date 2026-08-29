import { z } from "zod";
import { ClubDetailOutputDTOSchema } from "@/server/api/modules/clubs/dto/club-detail.dto";

export type GetClubRegistrationReviewInputDTO = Record<string, never>;
export const GetClubRegistrationReviewInputDTOSchema = z.object({});

export const GetClubRegistrationReviewOutputDTOSchema = ClubDetailOutputDTOSchema;
export type GetClubRegistrationReviewOutputDTO = z.infer<
  typeof GetClubRegistrationReviewOutputDTOSchema
>;
