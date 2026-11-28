export interface RenderPasswordResetEmailTextParams {
  resetUrl: string;
}

/** Not HTML-escaped on purpose — see club-invite-code-email.text.ts. */
export function renderPasswordResetEmailText(params: RenderPasswordResetEmailTextParams): string {
  return `ตั้งรหัสผ่านใหม่สำหรับบัญชี CUAtClub ของคุณ: ${params.resetUrl}

ลิงก์นี้หมดอายุใน 1 ชั่วโมง และใช้งานได้เพียงครั้งเดียว

ไม่ได้ขอตั้งรหัสผ่านใหม่ใช่หรือไม่? คุณสามารถละเว้นอีเมลฉบับนี้ได้อย่างปลอดภัย รหัสผ่านของคุณจะไม่เปลี่ยนแปลง

CUAtClub`;
}
