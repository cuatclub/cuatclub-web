import { z } from "zod";

export const EMAIL_REQUIRED_MESSAGE = "กรุณากรอกอีเมล";
export const EMAIL_INVALID_MESSAGE = "รูปแบบอีเมลไม่ถูกต้อง";
export const GENERIC_ERROR_MESSAGE = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
export const BULK_EMAILS_REQUIRED_MESSAGE = "กรุณากรอกอีเมลอย่างน้อย 1 รายการ";
export const BULK_EMAILS_MAX = 50;
export const BULK_EMAILS_MAX_MESSAGE = `เชิญได้สูงสุด ${BULK_EMAILS_MAX} รายการต่อครั้ง`;

export const inviteSingleSchema = z.object({
  email: z.string().trim().min(1, EMAIL_REQUIRED_MESSAGE).email(EMAIL_INVALID_MESSAGE),
});

export type InviteSingleFormValues = z.infer<typeof inviteSingleSchema>;

export const inviteBulkSchema = z.object({
  emailsText: z.string().trim().min(1, BULK_EMAILS_REQUIRED_MESSAGE),
});

export type InviteBulkFormValues = z.infer<typeof inviteBulkSchema>;

export interface ParsedBulkInvitation {
  email: string;
}

export interface ParseBulkInvitationsResult {
  invitations: ParsedBulkInvitation[];
  errors: string[];
}

const bulkEmailSchema = z.string().trim().toLowerCase().email();

/**
 * Each non-empty line is one email — parsed client-side so the admin gets immediate feedback on
 * a malformed line instead of round-tripping it to the server.
 */
export function parseBulkInvitations(raw: string): ParseBulkInvitationsResult {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const invitations: ParsedBulkInvitation[] = [];
  const errors: string[] = [];

  for (const line of lines) {
    const parsed = bulkEmailSchema.safeParse(line);
    if (!parsed.success) {
      errors.push(`อีเมลไม่ถูกต้อง: ${line}`);
      continue;
    }

    invitations.push({ email: parsed.data });
  }

  return { invitations, errors };
}
