import { describe, expect, it } from "vitest";

import {
  classifyStudentGeneralError,
  FACULTY_REQUIRED_MESSAGE,
  parseYearLabel,
  STATUS_REQUIRED_MESSAGE,
  studentGeneralSchema,
  UNIVERSITY_REQUIRED_MESSAGE,
  USERNAME_REQUIRED_MESSAGE,
  YEAR_OPTIONS,
  YEAR_REQUIRED_MESSAGE,
  yearLabel,
} from "./student-general-schema";

const validInput = {
  status: "CHULA",
  username: "john.doe",
  faculty: "วิศวกรรมศาสตร์",
  year: "ปี 1",
};

const messages = (input: Record<string, unknown>) => {
  const result = studentGeneralSchema.safeParse(input);
  if (result.success) throw new Error("expected validation to fail");
  return result.error.issues.map((issue) => issue.message);
};

describe("studentGeneralSchema", () => {
  it("accepts a Chula student without a university", () => {
    expect(studentGeneralSchema.safeParse(validInput).success).toBe(true);
  });

  it("requires every field", () => {
    expect(messages({ username: "", faculty: "", year: "" })).toEqual(
      expect.arrayContaining([
        STATUS_REQUIRED_MESSAGE,
        USERNAME_REQUIRED_MESSAGE,
        FACULTY_REQUIRED_MESSAGE,
        YEAR_REQUIRED_MESSAGE,
      ])
    );
  });

  it("trims the username before checking it is present", () => {
    expect(messages({ ...validInput, username: "   " })).toEqual([USERNAME_REQUIRED_MESSAGE]);
  });

  it("requires a university only for students from other universities", () => {
    expect(messages({ ...validInput, status: "OTHER_UNIVERSITY" })).toEqual([
      UNIVERSITY_REQUIRED_MESSAGE,
    ]);
    expect(messages({ ...validInput, status: "OTHER_UNIVERSITY", university: "  " })).toEqual([
      UNIVERSITY_REQUIRED_MESSAGE,
    ]);
    expect(
      studentGeneralSchema.safeParse({
        ...validInput,
        status: "OTHER_UNIVERSITY",
        university: "มหาวิทยาลัยธรรมศาสตร์",
      }).success
    ).toBe(true);
  });
});

describe("year labels", () => {
  it("offers years 1 to 4 and round-trips through the label", () => {
    expect(YEAR_OPTIONS).toEqual(["ปี 1", "ปี 2", "ปี 3", "ปี 4"]);
    expect(YEAR_OPTIONS.map(parseYearLabel)).toEqual([1, 2, 3, 4]);
    expect(yearLabel(3)).toBe("ปี 3");
  });
});

describe("classifyStudentGeneralError", () => {
  it("returns null when there is no error", () => {
    expect(classifyStudentGeneralError(null)).toBeNull();
  });

  it("maps CONFLICT to username-taken and anything else to generic", () => {
    expect(classifyStudentGeneralError({ data: { code: "CONFLICT" } })).toBe("username-taken");
    expect(classifyStudentGeneralError({ data: { code: "INTERNAL_SERVER_ERROR" } })).toBe(
      "generic"
    );
  });
});
