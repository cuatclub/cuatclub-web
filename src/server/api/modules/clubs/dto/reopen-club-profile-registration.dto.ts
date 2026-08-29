import { z } from "zod";

export type ReopenClubProfileRegistrationInputDTO = Record<string, never>;
export const ReopenClubProfileRegistrationInputDTOSchema = z.object({});

export const ReopenClubProfileRegistrationOutputDTOSchema = z.object({
  registrationStatus: z.literal("PENDING"),
});

export type ReopenClubProfileRegistrationOutputDTO = z.infer<
  typeof ReopenClubProfileRegistrationOutputDTOSchema
>;
