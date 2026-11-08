import { z } from "zod";

export const SOURCE_REQUIRED_MESSAGE = "กรุณาเลือกช่องทางที่คุณรู้จักเรา";
export const SOURCE_OTHER_REQUIRED_MESSAGE = "กรุณาระบุช่องทางที่คุณรู้จักเรา";
export const GENERIC_ERROR_MESSAGE = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";

export const REFERRAL_SOURCE_OPTIONS = [
  { value: "FRIEND", label: "เพื่อนหรือคนรู้จัก" },
  { value: "UNIVERSITY_EVENT", label: "กิจกรรม/อีเวนต์ในมหาลัย" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "LINE", label: "LINE" },
  { value: "OTHER", label: "อื่นๆ (โปรดระบุ)" },
] as const;

const SOURCE_VALUES = REFERRAL_SOURCE_OPTIONS.map((option) => option.value) as [
  (typeof REFERRAL_SOURCE_OPTIONS)[number]["value"],
  ...(typeof REFERRAL_SOURCE_OPTIONS)[number]["value"][],
];

export const studentSourceSchema = z
  .object({
    source: z.enum(SOURCE_VALUES, { errorMap: () => ({ message: SOURCE_REQUIRED_MESSAGE }) }),
    other: z.string().trim().max(500).optional(),
  })
  .refine((data) => data.source !== "OTHER" || !!data.other, {
    message: SOURCE_OTHER_REQUIRED_MESSAGE,
    path: ["other"],
  });

export type StudentSourceFormValues = z.infer<typeof studentSourceSchema>;
