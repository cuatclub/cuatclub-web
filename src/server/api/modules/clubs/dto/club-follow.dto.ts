import { z } from "zod";

export const ClubFollowInputDTOSchema = z.object({ clubId: z.string().uuid() });
export const ClubFollowOutputDTOSchema = z.object({ isFollowing: z.boolean() });
