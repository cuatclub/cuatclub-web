import type { z } from "zod";
import {
  ClubFollowInputDTOSchema,
  ClubFollowOutputDTOSchema,
} from "@/server/api/modules/clubs/dto/club-follow.dto";

export const FollowClubInputDTOSchema = ClubFollowInputDTOSchema;
export type FollowClubInputDTO = z.infer<typeof FollowClubInputDTOSchema>;

export const FollowClubOutputDTOSchema = ClubFollowOutputDTOSchema;
export type FollowClubOutputDTO = z.infer<typeof FollowClubOutputDTOSchema>;
