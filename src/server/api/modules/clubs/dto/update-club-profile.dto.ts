import type { z } from "zod";
import { ClubDetailOutputDTOSchema } from "@/server/api/modules/clubs/dto/club-detail.dto";
import { ClubProfileFieldsInputDTOSchema } from "@/server/api/modules/clubs/dto/club-profile-fields.dto";

export const UpdateClubProfileInputDTOSchema = ClubProfileFieldsInputDTOSchema;
export type UpdateClubProfileInputDTO = z.infer<typeof UpdateClubProfileInputDTOSchema>;

export const UpdateClubProfileOutputDTOSchema = ClubDetailOutputDTOSchema;
export type UpdateClubProfileOutputDTO = z.infer<typeof UpdateClubProfileOutputDTOSchema>;
