import { z } from "zod";
import {
  GetAllClubsInputDTOSchema,
  ClubListItemDTOSchema,
} from "@/server/api/modules/clubs/dto/get-all-clubs.dto";

export const GetAllClubsAdminInputDTOSchema = GetAllClubsInputDTOSchema;

export type GetAllClubsAdminInputDTO = z.infer<typeof GetAllClubsAdminInputDTOSchema>;

// Admin-only: adds the club's registration email, which the public `clubs.getAll` DTO must
// never expose (see get-all-clubs.dto.ts — that one stays public-safe).
export const ClubListItemAdminDTOSchema = ClubListItemDTOSchema.extend({
  email: z.string(),
});

export type ClubListItemAdminDTO = z.infer<typeof ClubListItemAdminDTOSchema>;

export const GetAllClubsAdminOutputDTOSchema = z.object({
  clubs: z.array(ClubListItemAdminDTOSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type GetAllClubsAdminOutputDTO = z.infer<typeof GetAllClubsAdminOutputDTOSchema>;
