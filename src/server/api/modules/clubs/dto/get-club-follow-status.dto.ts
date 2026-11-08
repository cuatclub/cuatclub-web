import type { z } from "zod";
import {
  ClubFollowInputDTOSchema,
  ClubFollowOutputDTOSchema,
} from "@/server/api/modules/clubs/dto/club-follow.dto";

export const GetClubFollowStatusInputDTOSchema = ClubFollowInputDTOSchema;
export type GetClubFollowStatusInputDTO = z.infer<typeof GetClubFollowStatusInputDTOSchema>;

export const GetClubFollowStatusOutputDTOSchema = ClubFollowOutputDTOSchema;
export type GetClubFollowStatusOutputDTO = z.infer<typeof GetClubFollowStatusOutputDTOSchema>;
