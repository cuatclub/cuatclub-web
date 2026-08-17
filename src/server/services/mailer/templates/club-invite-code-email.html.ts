const FONT_STACK = "'IBM Plex Sans Thai', 'Sarabun', Tahoma, Arial, sans-serif";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface RenderClubInviteCodeEmailHtmlParams {
  inviteCode: string;
  registerUrl: string;
  logoUrl: string;
}

export function renderClubInviteCodeEmailHtml(params: RenderClubInviteCodeEmailHtmlParams): string {
  const inviteCodeHtml = escapeHtml(params.inviteCode);
  const registerUrlHtml = escapeHtml(params.registerUrl);
  const logoUrlHtml = escapeHtml(params.logoUrl);

  return `<!DOCTYPE html>
<html lang="th" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>รหัสเชิญเข้าร่วม CUatClub ของคุณ</title>
</head>
<body style="margin:0; padding:0; background-color:#f0f0f0; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;">

  <!-- Preheader (hidden, shows in inbox preview) -->
  <div style="display:none; max-height:0; max-width:0; overflow:hidden; opacity:0; mso-hide:all; font-size:1px; line-height:1px; color:#f0f0f0;">
    รหัสเชิญเข้าร่วม CUatClub ของคุณอยู่ในอีเมลนี้ ใช้งานได้เพียงครั้งเดียว
  </div>
  <!-- Spacer to push preheader text away from visible content in some clients -->
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all;">
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f0f0;">
    <tr>
      <td align="center" style="padding:24px 16px;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; background-color:#ffffff;">

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 8px 40px; font-family:${FONT_STACK};">
              <img src="${logoUrlHtml}" width="91" height="48" alt="CUatClub" style="display:block; margin:0 0 20px 0; border:0; outline:none;" />
              <h1 style="margin:0; font-size:20px; line-height:32px; font-weight:700; color:#0a0a0a;">นี่คือรหัสเชิญเข้าร่วมของคุณ</h1>
              <p style="margin:12px 0 0 0; font-size:14px; line-height:23px; color:#595959;">
                กรอกรหัสนี้บนหน้าลงทะเบียนเพื่อเริ่มใช้งานบัญชีของคุณ
              </p>
            </td>
          </tr>

          <!-- Code block -->
          <tr>
            <td align="center" style="padding:24px 40px 8px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background-color:rgba(248,222,232,0.5); border-radius:6px; padding:18px 64px;">
                    <span style="font-family:${FONT_STACK}; font-size:32px; line-height:38px; font-weight:700; color:#dd598c;">${inviteCodeHtml}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Instructions -->
          <tr>
            <td align="center" style="padding:16px 40px 0 40px; font-family:${FONT_STACK};">
              <p style="margin:0; font-size:14px; line-height:23px; color:#595959;">
                รหัสนี้หมดอายุใน 14 วัน และใช้งานได้เพียงครั้งเดียว
              </p>
            </td>
          </tr>

          <!-- CTA button -->
          <tr>
            <td align="center" style="padding:28px 40px 8px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background-color:#dd598c; border-radius:8px;">
                    <a href="${registerUrlHtml}" target="_blank" style="display:inline-block; padding:12px 32px; font-family:${FONT_STACK}; font-size:15px; line-height:20px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:8px;">ลงทะเบียนชมรม</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Fallback URL -->
          <tr>
            <td align="center" style="padding:8px 40px 32px 40px; font-family:${FONT_STACK};">
              <p style="margin:0; font-size:12px; line-height:18px; color:#707070; word-break:break-all;">
                หรือคัดลอกลิงก์นี้ไปวางในเบราว์เซอร์:<br>
                <a href="${registerUrlHtml}" target="_blank" style="color:#dd598c; text-decoration:underline;">${registerUrlHtml}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px; border-top:1px solid #ececec; font-family:${FONT_STACK};" align="center">
              <p style="margin:0; font-size:12px; line-height:18px; color:#707070;">
                ไม่ได้ขอรหัสเชิญเข้าร่วม CUatClub ใช่หรือไม่? คุณสามารถละเว้นอีเมลฉบับนี้ได้อย่างปลอดภัย รหัสนี้จะไม่สามารถใช้งานได้กับผู้อื่น
              </p>
              <p style="margin:8px 0 0 0; font-size:12px; line-height:18px; color:#acacac;">
                &copy; CUatClub
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}
