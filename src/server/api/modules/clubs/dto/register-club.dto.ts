import { z } from "zod";
import { ClubOutputDTOSchema } from "@/server/api/modules/clubs/dto/club.dto";

// Printable ASCII, no space — English letters/numbers/symbols only, no whitespace padding.
const PASSWORD_REGEX = /^[\x21-\x7E]+$/;

export const RegisterClubInputDTOSchema = z
  .object({
    // Uppercased because codes are generated from an uppercase-only alphabet and compared with
    // a strict equality check — see InvitationCode.validate().
    inviteCode: z.string().length(6, "Invitation code must be 6 characters.").toUpperCase(),
    // Lowercased because better-auth stores and looks up emails lowercased — otherwise a
    // registration can succeed and still never be able to sign in.
    email: z.string().min(1).max(254).email("Invalid email format.").toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(PASSWORD_REGEX, "Password may only contain English letters, numbers, and symbols."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterClubInputDTO = z.infer<typeof RegisterClubInputDTOSchema>;

export const RegisterClubOutputDTOSchema = ClubOutputDTOSchema.pick({
  id: true,
  userId: true,
  registrationStatus: true,
}).extend({
  email: z.string(),
});

export type RegisterClubOutputDTO = z.infer<typeof RegisterClubOutputDTOSchema>;
