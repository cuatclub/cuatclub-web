import { z } from "zod";
import { ClubOutputDTOSchema, type ClubOutputDTO } from "@/server/api/modules/clubs/dto/club.dto";

export type ListClubsInputDTO = Record<string, never>;

export const ListClubsInputDTOSchema = z.object({});

export type ListClubsOutputDTO = ClubOutputDTO[];

export const ListClubsOutputDTOSchema = z.array(ClubOutputDTOSchema);
