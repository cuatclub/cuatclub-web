import { z } from "zod";
import { ClubProfileFieldsInputDTOSchema } from "@/server/api/modules/clubs/dto/club-profile-fields.dto";

export const SaveClubProfileRegistrationInputDTOSchema = ClubProfileFieldsInputDTOSchema.extend({
  id: z.string().uuid(),
});

export type SaveClubProfileRegistrationInputDTO = z.infer<
  typeof SaveClubProfileRegistrationInputDTOSchema
>;

export const SaveClubProfileRegistrationOutputDTOSchema = z.object({
  registrationStatus: z.literal("INFO_SUBMITTED"),
});

export type SaveClubProfileRegistrationOutputDTO = z.infer<
  typeof SaveClubProfileRegistrationOutputDTOSchema
>;
