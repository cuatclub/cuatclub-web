import type { z } from "zod";
import { SaveClubProfileRegistrationInputDTOSchema } from "@/server/api/modules/clubs/dto/save-club-profile-registration.dto";
import { ClubDetailOutputDTOSchema } from "@/server/api/modules/clubs/dto/club-detail.dto";

export const AdminUpdateClubInputDTOSchema = SaveClubProfileRegistrationInputDTOSchema;
export type AdminUpdateClubInputDTO = z.infer<typeof AdminUpdateClubInputDTOSchema>;

export const AdminUpdateClubOutputDTOSchema = ClubDetailOutputDTOSchema;
export type AdminUpdateClubOutputDTO = z.infer<typeof AdminUpdateClubOutputDTOSchema>;
