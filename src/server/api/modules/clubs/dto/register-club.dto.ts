import { z } from "zod";
import { ClubOutputDTOSchema } from "@/server/api/modules/clubs/dto/club.dto";
import {
  PASSWORDS_MISMATCH_ISSUE,
  passwordsMatch,
  RegisterCredentialsFieldsSchema,
} from "@/server/api/modules/users/dto/register-credentials.dto";

export const RegisterClubInputDTOSchema = RegisterCredentialsFieldsSchema.extend({
  // Uppercased because codes are generated from an uppercase-only alphabet and compared with
  // a strict equality check — see InvitationCode.validate().
  inviteCode: z.string().length(6, "Invitation code must be 6 characters.").toUpperCase(),
}).refine(passwordsMatch, PASSWORDS_MISMATCH_ISSUE);

export type RegisterClubInputDTO = z.infer<typeof RegisterClubInputDTOSchema>;

export const RegisterClubOutputDTOSchema = ClubOutputDTOSchema.pick({
  id: true,
  userId: true,
  registrationStatus: true,
}).extend({
  email: z.string(),
});

export type RegisterClubOutputDTO = z.infer<typeof RegisterClubOutputDTOSchema>;
