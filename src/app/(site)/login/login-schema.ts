import { z } from "zod";

// Better Auth's own `minPasswordLength` is 8 (see src/server/auth.ts); the
// printable-ASCII check keeps out Thai/other non-English input the login
// form can't guarantee round-trips cleanly.
const PRINTABLE_ASCII_ONLY = /^[\x20-\x7E]*$/;

export const EMAIL_REQUIRED_MESSAGE = "กรุณากรอกอีเมล";
export const EMAIL_INVALID_MESSAGE = "รูปแบบอีเมลไม่ถูกต้อง";
export const PASSWORD_REQUIRED_MESSAGE = "กรุณากรอกรหัสผ่าน";
export const PASSWORD_FORMAT_MESSAGE = "รหัสผ่านต้องมีอย่างน้อย 8 ตัว และใช้ตัวอักษรอังกฤษเท่านั้น";
export const INVALID_CREDENTIALS_MESSAGE = "รหัสผ่านหรืออีเมลไม่ถูกต้อง";
export const GENERIC_ERROR_MESSAGE = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";

// Better Auth doesn't export stable error codes for the client — `error.code`
// is derived by better-call from the thrown message text (upper-cased, spaces
// -> underscores; see node_modules/better-call/dist/error.mjs). Sign-in's
// "Invalid email or password" message becomes this code, so we can branch on
// it without string-matching the (possibly localized) message itself.
export const INVALID_CREDENTIALS_CODE = "INVALID_EMAIL_OR_PASSWORD";

export const loginSchema = z.object({
  email: z.string().trim().min(1, EMAIL_REQUIRED_MESSAGE).email(EMAIL_INVALID_MESSAGE),
  password: z
    .string()
    .min(1, PASSWORD_REQUIRED_MESSAGE)
    .refine(
      (value) => value.length >= 8 && PRINTABLE_ASCII_ONLY.test(value),
      PASSWORD_FORMAT_MESSAGE
    ),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export type AuthErrorClassification = "invalid-credentials" | "generic";

/**
 * Decides how a sign-in failure should be shown, without touching React
 * state — kept pure and separate from page.tsx so the branch that matters
 * most (don't blame the password for a 500) is unit-testable on its own,
 * not just exercised by hand against a real server.
 */
export function classifyAuthError(
  error: { code?: string } | null | undefined
): AuthErrorClassification | null {
  if (!error) return null;
  return error.code === INVALID_CREDENTIALS_CODE ? "invalid-credentials" : "generic";
}
