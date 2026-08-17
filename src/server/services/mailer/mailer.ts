import { env } from "@/config/env";
import { renderClubInviteCodeEmailHtml, renderClubInviteCodeEmailText } from "./templates";
import { sendViaResend } from "./transport";

export async function sendClubInviteCodeEmail(params: {
  to: string;
  inviteCode: string;
}): Promise<{ messageId: string }> {
  const SUBJECT = "รหัสเชิญเข้าร่วม CUatClub ของคุณ";
  const { to, inviteCode } = params;

  const registerUrl = `${env.APP_BASE_URL}/register`;
  const logoUrl = `${env.APP_BASE_URL}/images/logo.png`;

  const html = renderClubInviteCodeEmailHtml({ inviteCode, registerUrl, logoUrl });
  const text = renderClubInviteCodeEmailText({ inviteCode, registerUrl });

  return sendViaResend({ to, subject: SUBJECT, html, text });
}
