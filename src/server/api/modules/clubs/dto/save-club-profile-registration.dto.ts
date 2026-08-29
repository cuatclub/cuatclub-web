import { z } from "zod";

export const SaveClubProfileRegistrationInputDTOSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(100),
  image: z.string().url(),
  affiliationId: z.number().int().positive(),
  categories: z
    .array(z.number().int().positive())
    .min(1, "At least one category must be selected.")
    .refine((arr) => new Set(arr).size === arr.length, {
      message: "Duplicate categories are not allowed.",
    }),
  shortDescription: z.string().trim().min(1).max(180),
  longDescription: z.string().trim().min(1),
  imageUrls: z.array(z.string().url()).max(5),
  contacts: z
    .object({
      instagram: z.string().trim().max(255),
      facebook: z.string().trim().max(255),
      tiktok: z.string().trim().max(255),
      line_oa: z.string().trim().max(255),
    })
    .nullable(),
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
