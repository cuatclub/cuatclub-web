import { z } from "zod";
import { ClubOutputDTOSchema } from "@/server/api/modules/clubs/dto/club.dto";

export const SubmitClubProfileRegistrationInputDTOSchema = z.object({
  id: z.string().uuid(),
  affiliationId: z.number().int().min(1).nullable().optional(),
  shortDescription: z.string().max(500).nullable().optional(),
  longDescription: z.string().nullable().optional(),
  imageUrls: z.array(z.string().url()).optional(),
  contacts: z
    .object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      tiktok: z.string().optional(),
      line_oa: z.string().optional(),
    })
    .nullable()
    .optional(),
  registrationStatus: z.enum(["PENDING", "INFO_SUBMITTED", "COMPLETED"]).optional(),
});

export type SubmitClubProfileRegistrationInputDTO = z.infer<
  typeof SubmitClubProfileRegistrationInputDTOSchema
>;

export const SubmitClubProfileRegistrationOutputDTOSchema = ClubOutputDTOSchema;

export type SubmitClubProfileRegistrationOutputDTO = z.infer<
  typeof SubmitClubProfileRegistrationOutputDTOSchema
>;
