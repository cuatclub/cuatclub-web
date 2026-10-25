import { z } from "zod";

export const STATUS_REQUIRED_MESSAGE = "กรุณาเลือกสถานะ";
export const USERNAME_REQUIRED_MESSAGE = "กรุณากรอกชื่อผู้ใช้";
export const USERNAME_TAKEN_MESSAGE = "ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว";
export const FACULTY_REQUIRED_MESSAGE = "กรุณาเลือกคณะ";
export const YEAR_REQUIRED_MESSAGE = "กรุณาเลือกชั้นปี";
export const UNIVERSITY_REQUIRED_MESSAGE = "กรุณากรอกมหาวิทยาลัย";
export const GENERIC_ERROR_MESSAGE = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";

export const STUDENT_STATUS_OPTIONS = [
  { value: "CHULA", label: "นิสิตจุฬาฯ" },
  { value: "OTHER_UNIVERSITY", label: "นิสิตมหาลัยอื่น" },
] as const;

const YEAR_PREFIX = "ปี ";
export const YEAR_OPTIONS = [1, 2, 3, 4].map((year) => `${YEAR_PREFIX}${year}`);

export const yearLabel = (yearLevel: number) => `${YEAR_PREFIX}${yearLevel}`;
export const parseYearLabel = (label: string) => Number(label.slice(YEAR_PREFIX.length));

// The faculty and year dropdowns hold their *label* (the Select component only takes string
// options); the container maps them back to ids/numbers on submit.
export const studentGeneralSchema = z
  .object({
    status: z.enum(["CHULA", "OTHER_UNIVERSITY"], {
      errorMap: () => ({ message: STATUS_REQUIRED_MESSAGE }),
    }),
    username: z.string().trim().min(1, USERNAME_REQUIRED_MESSAGE).max(50),
    faculty: z.string().min(1, FACULTY_REQUIRED_MESSAGE),
    year: z.string().min(1, YEAR_REQUIRED_MESSAGE),
    university: z.string().trim().max(200).optional(),
  })
  .refine((data) => data.status !== "OTHER_UNIVERSITY" || !!data.university, {
    message: UNIVERSITY_REQUIRED_MESSAGE,
    path: ["university"],
  });

export type StudentGeneralFormValues = z.infer<typeof studentGeneralSchema>;

export type StudentGeneralErrorClassification = "username-taken" | "generic";

/** Pure counterpart to classifyRegisterStudentError for `students.saveGeneralInfo`. */
export function classifyStudentGeneralError(
  error: { data?: { code?: string | null } | null } | null | undefined
): StudentGeneralErrorClassification | null {
  if (!error) return null;
  return error.data?.code === "CONFLICT" ? "username-taken" : "generic";
}
