import { z } from "zod";

// Same rule as login (see src/app/login/login-schema.ts) — Better Auth's
// own `minPasswordLength` is 8, and the printable-ASCII check keeps out
// Thai/other non-English input the form can't guarantee round-trips
// cleanly. Message copy intentionally matches login's for consistency.
const PRINTABLE_ASCII_ONLY = /^[\x20-\x7E]*$/;

export const INVITATION_CODE_REQUIRED_MESSAGE = "กรุณากรอกรหัสเชิญ";
// Matches the server's exact-length check (RegisterClubInputDTOSchema) — codes
// are generated 6 characters long, so anything else can never be valid and
// isn't worth a round trip to find out.
export const INVITATION_CODE_FORMAT_MESSAGE = "รหัสเชิญต้องมีความยาว 6 ตัวอักษร";
export const EMAIL_REQUIRED_MESSAGE = "กรุณากรอกอีเมล";
export const EMAIL_INVALID_MESSAGE = "รูปแบบอีเมลไม่ถูกต้อง";
export const PASSWORD_REQUIRED_MESSAGE = "กรุณากรอกรหัสผ่าน";
export const PASSWORD_FORMAT_MESSAGE = "รหัสผ่านต้องมีอย่างน้อย 8 ตัว และใช้ตัวอักษรอังกฤษเท่านั้น";
export const CONFIRM_PASSWORD_REQUIRED_MESSAGE = "กรุณายืนยันรหัสผ่าน";
export const CONFIRM_PASSWORD_MISMATCH_MESSAGE = "รหัสผ่านไม่ตรงกัน";
export const GENERIC_ERROR_MESSAGE = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";

// Server-driven cases from #92's acceptance criteria — not checkable without
// a network round trip, so they're attached in page.tsx via react-hook-form's
// setError, the same way login-schema.ts's classifyAuthError maps an async
// failure onto a field.
export const CODE_EMAIL_MISMATCH_MESSAGE = "อีเมลหรือรหัสเชิญไม่ถูกต้อง";
export const EMAIL_NOT_INVITED_MESSAGE = "อีเมลนี้ยังไม่ได้รับคำเชิญ";
export const EMAIL_ALREADY_USED_MESSAGE = "อีเมลนี้ถูกใช้ไปแล้ว";

export const registerClubSchema = z
  .object({
    invitationCode: z
      .string()
      .trim()
      .min(1, INVITATION_CODE_REQUIRED_MESSAGE)
      .refine((value) => value.length === 6, INVITATION_CODE_FORMAT_MESSAGE),
    email: z.string().trim().min(1, EMAIL_REQUIRED_MESSAGE).email(EMAIL_INVALID_MESSAGE),
    password: z
      .string()
      .min(1, PASSWORD_REQUIRED_MESSAGE)
      .refine(
        (value) => value.length >= 8 && PRINTABLE_ASCII_ONLY.test(value),
        PASSWORD_FORMAT_MESSAGE
      ),
    confirmPassword: z.string().min(1, CONFIRM_PASSWORD_REQUIRED_MESSAGE),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: CONFIRM_PASSWORD_MISMATCH_MESSAGE,
    path: ["confirmPassword"],
  });

export type RegisterClubFormValues = z.infer<typeof registerClubSchema>;

export type RegisterClubErrorClassification =
  | "code-mismatch"
  | "email-not-invited"
  | "email-taken"
  | "generic";

/**
 * Decides how a `clubs.register` failure should be shown, without touching
 * React state — kept pure and separate from page.tsx, mirroring
 * login-schema.ts's classifyAuthError.
 *
 * `BAD_REQUEST` is thrown both for the domain "invite code doesn't match
 * this email" case (registerClub.usecase.ts's validationError) and for a raw
 * input-validation failure that bypassed the client schema — init.ts's
 * errorFormatter attaches `zodError` only for the latter, so that's the flag
 * used to tell them apart rather than trusting the code alone.
 *
 * `NOT_FOUND` ("no invitation exists for this email") gets its own
 * classification, distinct from the BAD_REQUEST mismatch case, so the form
 * can tell the user their email specifically hasn't been invited yet.
 */
export function classifyRegisterClubError(
  error: { data?: { code?: string | null; zodError?: unknown } | null } | null | undefined
): RegisterClubErrorClassification | null {
  if (!error) return null;
  const code = error.data?.code;
  if (code === "CONFLICT") return "email-taken";
  if (code === "NOT_FOUND") return "email-not-invited";
  if (code === "BAD_REQUEST" && !error.data?.zodError) return "code-mismatch";
  return "generic";
}
