import { z } from "zod";
import { ClubOutputDTOSchema } from "@/server/api/modules/clubs/dto/club.dto";

export const UpdateClubInputDTOSchema = z.object({
  id: z.string().uuid(),
  affiliationId: z.number().int().min(1).nullable().optional(),
  shortDescription: z.string().max(500).nullable().optional(),
  longDescription: z.string().nullable().optional(),
  imageUrls: z.array(z.string()).optional(),
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

export type UpdateClubInputDTO = z.infer<typeof UpdateClubInputDTOSchema>;

export const UpdateClubOutputDTOSchema = ClubOutputDTOSchema;

export type UpdateClubOutputDTO = z.infer<typeof UpdateClubOutputDTOSchema>;
