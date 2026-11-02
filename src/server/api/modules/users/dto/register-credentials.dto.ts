import { z } from "zod";

// Printable ASCII, no space — English letters/numbers/symbols only, no whitespace padding.
const PASSWORD_REGEX = /^[\x21-\x7E]+$/;

export const RegisterCredentialsFieldsSchema = z.object({
  // Lowercased because better-auth stores and looks up emails lowercased — otherwise a
  // registration can succeed and still never be able to sign in.
  email: z.string().min(1).max(254).email("Invalid email format.").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(PASSWORD_REGEX, "Password may only contain English letters, numbers, and symbols."),
  confirmPassword: z.string(),
});

export const passwordsMatch = (data: { password: string; confirmPassword: string }) =>
  data.password === data.confirmPassword;

export const PASSWORDS_MISMATCH_ISSUE = {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
};
