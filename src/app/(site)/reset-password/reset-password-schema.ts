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

export const resetPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: confirmPasswordField,
  })
  .refine(passwordsMatch, PASSWORDS_MISMATCH_ISSUE);

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
