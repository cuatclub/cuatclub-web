import { z } from "zod";

export const GENERIC_ERROR_MESSAGE = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export const editCategorySchema = z.object({
  label: z.string().trim().min(1, "กรุณากรอกชื่อหมวดหมู่").max(50),
  fontColor: z.string().regex(HEX_COLOR_REGEX, "ต้องเป็นรหัสสี เช่น #475569"),
  backgroundColor: z.string().regex(HEX_COLOR_REGEX, "ต้องเป็นรหัสสี เช่น #E2E8F0"),
});

export type EditCategoryFormValues = z.infer<typeof editCategorySchema>;

export const editAffiliationSchema = z.object({
  label: z.string().trim().min(1, "กรุณากรอกชื่อหน่วยงานสังกัด").max(100),
});

export type EditAffiliationFormValues = z.infer<typeof editAffiliationSchema>;
