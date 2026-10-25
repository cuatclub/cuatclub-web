import { z } from "zod";

import {
  confirmPasswordField,
  emailField,
  passwordField,
  PASSWORDS_MISMATCH_ISSUE,
  passwordsMatch,
} from "./register-schema";

export const registerStudentSchema = z
  .object({
    email: emailField,
    password: passwordField,
    confirmPassword: confirmPasswordField,
  })
  .refine(passwordsMatch, PASSWORDS_MISMATCH_ISSUE);

export type RegisterStudentFormValues = z.infer<typeof registerStudentSchema>;

export type RegisterStudentErrorClassification = "email-taken" | "generic";

/**
 * Decides how a `students.register` failure should be shown, without touching
 * React state — mirrors classifyRegisterClubError. `CONFLICT` is the usecase's
 * "this email is already registered"; everything else (including a raw
 * input-validation failure that slipped past the client schema) is generic.
 */
export function classifyRegisterStudentError(
  error: { data?: { code?: string | null } | null } | null | undefined
): RegisterStudentErrorClassification | null {
  if (!error) return null;
  return error.data?.code === "CONFLICT" ? "email-taken" : "generic";
}
