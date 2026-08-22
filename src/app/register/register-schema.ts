import { z } from "zod";

// Same rule as login (see src/app/login/login-schema.ts) — Better Auth's
// own `minPasswordLength` is 8, and the printable-ASCII check keeps out
// Thai/other non-English input the form can't guarantee round-trips
// cleanly. Message copy intentionally matches login's for consistency.
const PRINTABLE_ASCII_ONLY = /^[\x20-\x7E]*$/;

export const INVITATION_CODE_REQUIRED_MESSAGE = "กรุณากรอกรหัสเชิญ";
export const EMAIL_REQUIRED_MESSAGE = "กรุณากรอกอีเมล";
export const EMAIL_INVALID_MESSAGE = "รูปแบบอีเมลไม่ถูกต้อง";
export const PASSWORD_REQUIRED_MESSAGE = "กรุณากรอกรหัสผ่าน";
export const PASSWORD_FORMAT_MESSAGE = "รหัสผ่านต้องมีอย่างน้อย 8 ตัว และใช้ตัวอักษรอังกฤษเท่านั้น";
export const CONFIRM_PASSWORD_REQUIRED_MESSAGE = "กรุณายืนยันรหัสผ่าน";
export const CONFIRM_PASSWORD_MISMATCH_MESSAGE = "รหัสผ่านไม่ตรงกัน";

// Server-driven cases from #92's acceptance criteria — not part of this
// schema, since neither is checkable without a network round trip. Defined
// here now so the copy is settled; #97/#98 wire the actual API call and
// attach these via react-hook-form's setError, the same way login-schema.ts's
// classifyAuthError maps an async failure onto a field.
export const CODE_EMAIL_MISMATCH_MESSAGE = "อีเมลหรือรหัสเชิญไม่ถูกต้อง";
export const EMAIL_ALREADY_USED_MESSAGE = "อีเมลนี้ถูกใช้ไปแล้ว";

export const registerClubSchema = z
  .object({
    invitationCode: z.string().trim().min(1, INVITATION_CODE_REQUIRED_MESSAGE),
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
