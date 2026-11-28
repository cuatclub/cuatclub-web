import { z } from "zod";

import { GENERIC_ERROR_MESSAGE } from "@/app/(site)/login/login-schema";
import { emailField } from "@/app/(site)/register/register-schema";
import { EMAIL_SEND_FAILED_CODE, USER_NOT_FOUND_CODE } from "@/lib/password-reset";

export const forgotPasswordSchema = z.object({ email: emailField });

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const TOO_MANY_REQUESTS_MESSAGE = "ส่งคำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง";
export const USER_NOT_FOUND_MESSAGE = "ไม่พบบัญชีที่ใช้อีเมลนี้";
export const EMAIL_SEND_FAILED_MESSAGE = "ส่งอีเมลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";

/** Which field a failed reset request belongs on, and what to say there. */
export function describeForgotPasswordError(error: { status?: number; code?: string }): {
  field: "email" | "root";
  message: string;
} {
  if (error.code === USER_NOT_FOUND_CODE) {
    return { field: "email", message: USER_NOT_FOUND_MESSAGE };
  }
  if (error.status === 429) return { field: "root", message: TOO_MANY_REQUESTS_MESSAGE };
  if (error.code === EMAIL_SEND_FAILED_CODE) {
    return { field: "root", message: EMAIL_SEND_FAILED_MESSAGE };
  }
  return { field: "root", message: GENERIC_ERROR_MESSAGE };
}
