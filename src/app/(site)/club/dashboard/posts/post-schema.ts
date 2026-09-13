import { z } from "zod";

export const MAX_POSTER_FILE_SIZE = 10 * 1024 * 1024;
export const TITLE_MAX_LENGTH = 150;
export const YEAR_LEVELS = [1, 2, 3, 4] as const;

export const POSTER_REQUIRED_MESSAGE = "กรุณาอัปโหลดรูปโปสเตอร์";
export const POSTER_TYPE_MESSAGE = "รองรับเฉพาะไฟล์ PNG หรือ JPG/JPEG";
export const POSTER_SIZE_MESSAGE = "ขนาดไฟล์ต้องไม่เกิน 10 MB";
export const TITLE_REQUIRED_MESSAGE = "กรุณากรอกหัวข้อ";
export const TITLE_MAX_MESSAGE = `หัวข้อต้องมีความยาวไม่เกิน ${TITLE_MAX_LENGTH} ตัวอักษร`;
export const APPLICATION_FORM_URL_REQUIRED_MESSAGE = "กรุณากรอกลิงก์ฟอร์มรับสมัคร";
export const APPLICATION_FORM_URL_INVALID_MESSAGE = "รูปแบบลิงก์ไม่ถูกต้อง";
export const DATE_RANGE_REQUIRED_MESSAGE = "กรุณาเลือกช่วงเวลา";
export const DATE_RANGE_ORDER_MESSAGE = "วันสิ้นสุดต้องไม่มาก่อนวันเริ่มต้น";
export const ACTIVITY_TYPE_REQUIRED_MESSAGE = "กรุณาเลือกประเภทกิจกรรม";
export const CATEGORIES_REQUIRED_MESSAGE = "กรุณาเลือกอย่างน้อย 1 หมวดหมู่";
export const DESCRIPTION_REQUIRED_MESSAGE = "กรุณากรอกรายละเอียด";
export const AUDIENCE_REQUIRED_MESSAGE = "กรุณาเลือกผู้มีสิทธิ์เข้าร่วม";
export const YEAR_LEVELS_REQUIRED_MESSAGE = "กรุณาเลือกชั้นปี";
export const FACULTIES_REQUIRED_MESSAGE = "กรุณาเลือกคณะ";
export const SUBMIT_ERROR_MESSAGE = "ไม่สามารถสร้างโพสต์ได้ กรุณาลองใหม่อีกครั้ง";

export type PosterImageContentType = "image/png" | "image/jpeg";

type ImageFileLike = Pick<File, "name" | "size" | "type">;

/**
 * The poster field's value: a newly picked `File` pending upload, the URL string of an
 * already-uploaded poster (an existing post opened for editing keeps its poster unless the
 * user picks a replacement), or `null` when nothing is selected yet.
 */
export type PosterFieldValue = File | string | null;

const EXTENSION_CONTENT_TYPES: Record<string, PosterImageContentType> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

function isImageFileLike(value: unknown): value is ImageFileLike {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.type === "string" &&
    typeof candidate.size === "number" &&
    Number.isFinite(candidate.size) &&
    candidate.size >= 0
  );
}

function isPosterUrl(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

export function getPosterContentType(file: ImageFileLike): PosterImageContentType | null {
  if (file.type) {
    const contentType = file.type.toLowerCase();
    return contentType === "image/png" || contentType === "image/jpeg" ? contentType : null;
  }
  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension ? (EXTENSION_CONTENT_TYPES[extension] ?? null) : null;
}

function getPosterFileValidationMessage(value: unknown): string | null {
  if (!isImageFileLike(value)) return POSTER_TYPE_MESSAGE;
  if (!getPosterContentType(value)) return POSTER_TYPE_MESSAGE;
  if (value.size > MAX_POSTER_FILE_SIZE) return POSTER_SIZE_MESSAGE;
  return null;
}

// Newly picked files still get the PNG/JPEG + 10 MB validation; an existing poster URL (a
// string) is assumed already valid, since it was uploaded and accepted before. `null` is only
// rejected by the required check below, so it doesn't also get flagged as the wrong type.
const posterSchema = z
  .custom<PosterFieldValue>(
    (value) => value === null || isPosterUrl(value) || isImageFileLike(value),
    POSTER_TYPE_MESSAGE
  )
  .superRefine((value, ctx) => {
    if (value === null || typeof value === "string") return;
    const message = getPosterFileValidationMessage(value);
    if (message) ctx.addIssue({ code: z.ZodIssueCode.custom, message });
  })
  .superRefine((value, ctx) => {
    if (value === null)
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: POSTER_REQUIRED_MESSAGE });
  });

const requiredDate = z
  .date({ invalid_type_error: DATE_RANGE_REQUIRED_MESSAGE })
  .nullable()
  .superRefine((value, ctx) => {
    if (value === null)
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: DATE_RANGE_REQUIRED_MESSAGE });
  });

export const createPostSchema = z
  .object({
    poster: posterSchema,
    title: z
      .string()
      .trim()
      .min(1, TITLE_REQUIRED_MESSAGE)
      .max(TITLE_MAX_LENGTH, TITLE_MAX_MESSAGE),
    applicationFormUrl: z
      .string()
      .trim()
      .min(1, APPLICATION_FORM_URL_REQUIRED_MESSAGE)
      .url(APPLICATION_FORM_URL_INVALID_MESSAGE),
    applicationStartAt: requiredDate,
    applicationEndAt: requiredDate,
    activityType: z.string().min(1, ACTIVITY_TYPE_REQUIRED_MESSAGE),
    categoryIds: z.array(z.number().int().positive()).min(1, CATEGORIES_REQUIRED_MESSAGE),
    description: z.string().trim().min(1, DESCRIPTION_REQUIRED_MESSAGE),
    audience: z
      .enum(["CHULA_STUDENT", "GENERAL_PUBLIC"])
      .nullable()
      .superRefine((value, ctx) => {
        if (value === null)
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: AUDIENCE_REQUIRED_MESSAGE });
      }),
    yearLevels: z.array(z.number().int().min(1).max(4)).min(1, YEAR_LEVELS_REQUIRED_MESSAGE),
    facultyIds: z.array(z.number().int().positive()).min(1, FACULTIES_REQUIRED_MESSAGE),
  })
  .superRefine((values, ctx) => {
    if (
      values.applicationStartAt &&
      values.applicationEndAt &&
      values.applicationEndAt < values.applicationStartAt
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["applicationEndAt"],
        message: DATE_RANGE_ORDER_MESSAGE,
      });
    }
  });

export type CreatePostFormValues = z.infer<typeof createPostSchema>;

export const EMPTY_POST_FORM_VALUES: CreatePostFormValues = {
  poster: null,
  title: "",
  applicationFormUrl: "",
  applicationStartAt: null,
  applicationEndAt: null,
  activityType: "",
  categoryIds: [],
  description: "",
  audience: null,
  yearLevels: [],
  facultyIds: [],
};
