import type { z } from "zod";
import {
  ClubFollowInputDTOSchema,
  ClubFollowOutputDTOSchema,
} from "@/server/api/modules/clubs/dto/club-follow.dto";

export const UnfollowClubInputDTOSchema = ClubFollowInputDTOSchema;
export type UnfollowClubInputDTO = z.infer<typeof UnfollowClubInputDTOSchema>;

export const UnfollowClubOutputDTOSchema = ClubFollowOutputDTOSchema;
export type UnfollowClubOutputDTO = z.infer<typeof UnfollowClubOutputDTOSchema>;
