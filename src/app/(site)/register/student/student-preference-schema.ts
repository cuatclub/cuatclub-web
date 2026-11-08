import { z } from "zod";

export const CATEGORY_REQUIRED_MESSAGE = "กรุณาเลือกอย่างน้อย 1 หมวดหมู่";
export const ACTIVITY_TYPE_REQUIRED_MESSAGE = "กรุณาเลือกอย่างน้อย 1 ประเภทกิจกรรม";
export const GENERIC_ERROR_MESSAGE = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";

export const studentPreferenceSchema = z.object({
  categoryIds: z.array(z.number()).min(1, CATEGORY_REQUIRED_MESSAGE),
  activityTypeIds: z.array(z.number()).min(1, ACTIVITY_TYPE_REQUIRED_MESSAGE),
});

export type StudentPreferenceFormValues = z.infer<typeof studentPreferenceSchema>;
