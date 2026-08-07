import { z } from "zod";
import { ClubOutputDTOSchema } from "@/server/api/modules/clubs/dto/club.dto";

export type ListClubsInputDTO = Record<string, never>;

export const ListClubsInputDTOSchema = z.object({});

export const ListClubsOutputDTOSchema = z.array(ClubOutputDTOSchema);

export type ListClubsOutputDTO = z.infer<typeof ListClubsOutputDTOSchema>;
