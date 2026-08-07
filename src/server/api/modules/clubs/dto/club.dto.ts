import { z } from "zod";

export const ClubOutputDTOSchema = z.object({
  id: z.string(),
  userId: z.string(),
  registrationStatus: z.enum(["PENDING", "INFO_SUBMITTED", "COMPLETED"]),
  name: z.string().nullable(),
  logoUrl: z.string().nullable(),
  facultyId: z.number().nullable(),
  shortDescription: z.string().nullable(),
  longDescription: z.string().nullable(),
  imageUrls: z.array(z.string()),
  contacts: z
    .object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      tiktok: z.string().optional(),
      line_oa: z.string().optional(),
    })
    .nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ClubOutputDTO = z.infer<typeof ClubOutputDTOSchema>;
