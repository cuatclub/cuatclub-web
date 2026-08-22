import { z } from "zod";

export const SaveClubProfileRegistrationInputDTOSchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  image: z.string().nullable().optional(),
  affiliationId: z.number().int().min(1).nullable().optional(),
  categories: z.array(z.number()).optional(),
  shortDescription: z.string().max(180).nullable().optional(),
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
});

export type SaveClubProfileRegistrationInputDTO = z.infer<
  typeof SaveClubProfileRegistrationInputDTOSchema
>;

export const SaveClubProfileRegistrationOutputDTOSchema = z.object({
  registrationStatus: z.enum(["INFO_SUBMITTED"]).optional(),
});

export type SaveClubProfileRegistrationOutputDTO = z.infer<
  typeof SaveClubProfileRegistrationOutputDTOSchema
>;
