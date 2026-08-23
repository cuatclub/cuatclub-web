import { z } from "zod";

export const SaveClubProfileRegistrationInputDTOSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  image: z.string().url(),
  affiliationId: z.number().int().min(1).nullable(),
  categories: z
    .array(z.number().int().positive())
    .refine((arr) => arr.length > 0, {
      message: "At least one category must be selected.",
    })
    .refine((arr) => new Set(arr).size === arr.length, {
      message: "Duplicate categories are not allowed.",
    }),
  shortDescription: z.string().max(180),
  longDescription: z.string(),
  imageUrls: z.array(z.string().url()),
  contacts: z
    .object({
      instagram: z.string(),
      facebook: z.string(),
      tiktok: z.string(),
      line_oa: z.string(),
    })
    .nullable(),
});

export type SaveClubProfileRegistrationInputDTO = z.infer<
  typeof SaveClubProfileRegistrationInputDTOSchema
>;

export const SaveClubProfileRegistrationOutputDTOSchema = z.object({
  registrationStatus: z.enum(["INFO_SUBMITTED"]),
});

export type SaveClubProfileRegistrationOutputDTO = z.infer<
  typeof SaveClubProfileRegistrationOutputDTOSchema
>;
