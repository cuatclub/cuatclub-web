import { z } from "zod";

export const SubmitClubProfileRegistrationInputDTOSchema = z.object({
  id: z.string().uuid(),
});

export type SubmitClubProfileRegistrationInputDTO = z.infer<
  typeof SubmitClubProfileRegistrationInputDTOSchema
>;

export const SubmitClubProfileRegistrationOutputDTOSchema = z.object({
  registrationStatus: z.literal("COMPLETED"),
});

export type SubmitClubProfileRegistrationOutputDTO = z.infer<
  typeof SubmitClubProfileRegistrationOutputDTOSchema
>;
