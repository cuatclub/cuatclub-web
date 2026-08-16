import { z } from "zod";
import { ClubOutputDTOSchema } from "@/server/api/modules/clubs/dto/club.dto";

export const CreateClubInputDTOSchema = z.object({
  userId: z.string(),
  affiliationId: z.number().int().min(1).nullable().optional(),
  shortDescription: z.string().max(500).nullable().optional(),
  longDescription: z.string().nullable().optional(),
  imageUrls: z.array(z.string()).default([]),
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

export type CreateClubInputDTO = z.infer<typeof CreateClubInputDTOSchema>;

export const CreateClubOutputDTOSchema = ClubOutputDTOSchema;

export type CreateClubOutputDTO = z.infer<typeof CreateClubOutputDTOSchema>;
