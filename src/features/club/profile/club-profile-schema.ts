import { z } from "zod";

export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_ATMOSPHERE_PHOTOS = 5;

export const LOGO_REQUIRED_MESSAGE = "กรุณาอัปโหลดรูปโปรไฟล์ชมรม";
export const CLUB_NAME_REQUIRED_MESSAGE = "กรุณากรอกชื่อชมรม";
export const CLUB_NAME_MAX_MESSAGE = "ชื่อชมรมต้องมีความยาวไม่เกิน 100 ตัวอักษร";
export const AFFILIATION_REQUIRED_MESSAGE = "กรุณาเลือกคณะ/สังกัด";
export const CATEGORIES_REQUIRED_MESSAGE = "กรุณาเลือกอย่างน้อย 1 หมวดหมู่";
export const CATEGORIES_UNIQUE_MESSAGE = "หมวดหมู่ต้องไม่ซ้ำกัน";
export const SHORT_DESCRIPTION_REQUIRED_MESSAGE = "กรุณากรอกคำอธิบายแบบย่อ";
export const SHORT_DESCRIPTION_MAX_MESSAGE = "คำอธิบายแบบย่อต้องมีความยาวไม่เกิน 180 ตัวอักษร";
export const LONG_DESCRIPTION_REQUIRED_MESSAGE = "กรุณากรอกคำอธิบายแบบละเอียด";
export const IMAGE_TYPE_MESSAGE = "รองรับเฉพาะไฟล์ PNG หรือ JPG/JPEG";
export const IMAGE_SIZE_MESSAGE = "ขนาดไฟล์ต้องไม่เกิน 10 MB";
export const ATMOSPHERE_PHOTOS_MAX_MESSAGE = "อัปโหลดรูปบรรยากาศได้สูงสุด 5 รูป";
export const CONTACT_MAX_MESSAGE = "ข้อมูลติดต่อแต่ละช่องต้องมีความยาวไม่เกิน 255 ตัวอักษร";

type ImageFileLike = Pick<File, "name" | "size" | "type">;

export type ClubImageContentType = "image/png" | "image/jpeg";

export type ClubProfileImage = { kind: "persisted"; url: string } | { kind: "new"; file: File };

const ALLOWED_IMAGE_MIME_TYPES = new Set<ClubImageContentType>(["image/png", "image/jpeg"]);

const EXTENSION_CONTENT_TYPES: Record<string, ClubImageContentType> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

function isClubImageContentType(value: string): value is ClubImageContentType {
  return value === "image/png" || value === "image/jpeg";
}

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

export function getImageFileValidationMessage(value: unknown): string | null {
  if (!isImageFileLike(value)) return IMAGE_TYPE_MESSAGE;
  if (!getClubImageContentType(value)) return IMAGE_TYPE_MESSAGE;
  if (value.size > MAX_IMAGE_FILE_SIZE) return IMAGE_SIZE_MESSAGE;
  return null;
}

export function getClubImageContentType(file: ImageFileLike): ClubImageContentType | null {
  if (file.type) {
    const contentType = file.type.toLowerCase();
    return isClubImageContentType(contentType) && ALLOWED_IMAGE_MIME_TYPES.has(contentType)
      ? contentType
      : null;
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension ? (EXTENSION_CONTENT_TYPES[extension] ?? null) : null;
}

const imageFileSchema = z
  .custom<File>(isImageFileLike, IMAGE_TYPE_MESSAGE)
  .superRefine((file, ctx) => {
    const message = getImageFileValidationMessage(file);
    if (message) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message });
    }
  });

const clubProfileImageSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("persisted"), url: z.string().url() }),
  z.object({ kind: z.literal("new"), file: imageFileSchema }),
]);

const logoSchema = clubProfileImageSchema.nullable().superRefine((image, ctx) => {
  if (image === null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: LOGO_REQUIRED_MESSAGE });
  }
});

const contactSchema = z.string().trim().max(255, CONTACT_MAX_MESSAGE);

export const clubProfileSchema = z.object({
  logo: logoSchema,
  name: z.string().trim().min(1, CLUB_NAME_REQUIRED_MESSAGE).max(100, CLUB_NAME_MAX_MESSAGE),
  affiliation: z.string().trim().min(1, AFFILIATION_REQUIRED_MESSAGE),
  categories: z
    .array(z.string())
    .min(1, CATEGORIES_REQUIRED_MESSAGE)
    .refine((values) => new Set(values).size === values.length, CATEGORIES_UNIQUE_MESSAGE),
  shortDescription: z
    .string()
    .trim()
    .min(1, SHORT_DESCRIPTION_REQUIRED_MESSAGE)
    .max(180, SHORT_DESCRIPTION_MAX_MESSAGE),
  longDescription: z.string().trim().min(1, LONG_DESCRIPTION_REQUIRED_MESSAGE),
  atmospherePhotos: z
    .array(clubProfileImageSchema)
    .max(MAX_ATMOSPHERE_PHOTOS, ATMOSPHERE_PHOTOS_MAX_MESSAGE),
  contacts: z.object({
    instagram: contactSchema,
    facebook: contactSchema,
    tiktok: contactSchema,
    lineOa: contactSchema,
  }),
});

export type ClubProfileFormValues = z.infer<typeof clubProfileSchema>;
