import { env } from "@/config/env";
import {
  renderClubInviteCodeEmailHtml,
  renderClubInviteCodeEmailText,
  renderPasswordResetEmailHtml,
  renderPasswordResetEmailText,
} from "./templates";
import { sendViaResend } from "./transport";

export async function sendClubInviteCodeEmail(params: {
  to: string;
  inviteCode: string;
}): Promise<{ messageId: string }> {
  const SUBJECT = "รหัสเชิญเข้าร่วม CUAtClub ของคุณ";
  const { to, inviteCode } = params;

  const registerUrl = `${env.APP_BASE_URL}/register`;
  const logoUrl = `${env.APP_BASE_URL}/images/logo.png`;

  const html = renderClubInviteCodeEmailHtml({ inviteCode, registerUrl, logoUrl });
  const text = renderClubInviteCodeEmailText({ inviteCode, registerUrl });

  return sendViaResend({ to, subject: SUBJECT, html, text });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
}): Promise<{ messageId: string }> {
  const SUBJECT = "ตั้งรหัสผ่านใหม่สำหรับบัญชี CUAtClub";
  const { to, resetUrl } = params;

  const logoUrl = `${env.APP_BASE_URL}/images/logo.png`;

  const html = renderPasswordResetEmailHtml({ resetUrl, logoUrl });
  const text = renderPasswordResetEmailText({ resetUrl });

  return sendViaResend({ to, subject: SUBJECT, html, text });
}
