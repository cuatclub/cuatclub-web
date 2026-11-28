import { z } from "zod";

import {
  confirmPasswordField,
  passwordField,
  PASSWORDS_MISMATCH_ISSUE,
  passwordsMatch,
} from "@/app/(site)/register/register-schema";

export const RESET_PASSWORD_PATH = "/reset-password";

export const INVALID_LINK_MESSAGE = "ลิงก์ตั้งรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว";

// Derived by better-call from better-auth's "Invalid token" message — see login-schema.ts.
export const INVALID_TOKEN_CODE = "INVALID_TOKEN";

// better-auth's default `maxPasswordLength`.
const PASSWORD_MAX_LENGTH = 128;
export const PASSWORD_TOO_LONG_MESSAGE = `รหัสผ่านต้องไม่เกิน ${PASSWORD_MAX_LENGTH} ตัว`;

export const resetPasswordSchema = z
  .object({
    password: passwordField.refine(
      (value) => value.length <= PASSWORD_MAX_LENGTH,
      PASSWORD_TOO_LONG_MESSAGE
    ),
    confirmPassword: confirmPasswordField,
  })
  .refine(passwordsMatch, PASSWORDS_MISMATCH_ISSUE);

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
