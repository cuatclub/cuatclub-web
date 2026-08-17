export interface RenderClubInviteCodeEmailTextParams {
  inviteCode: string;
  registerUrl: string;
}

/**
 * Deliberately not HTML-escaped — HTML entities in a text/plain body are a rendering bug,
 * not a security control.
 */
export function renderClubInviteCodeEmailText(params: RenderClubInviteCodeEmailTextParams): string {
  return `นี่คือรหัสเชิญเข้าร่วม CUatClub ของคุณ: ${params.inviteCode}

กรอกรหัสนี้บนหน้าลงทะเบียนเพื่อเริ่มใช้งานบัญชีของคุณ รหัสนี้หมดอายุใน 14 วัน และใช้งานได้เพียงครั้งเดียว

ลงทะเบียนชมรม: ${params.registerUrl}

ไม่ได้ขอรหัสเชิญเข้าร่วม CUatClub ใช่หรือไม่? คุณสามารถละเว้นอีเมลฉบับนี้ได้อย่างปลอดภัย รหัสนี้จะไม่สามารถใช้งานได้กับผู้อื่น

CUatClub`;
}
