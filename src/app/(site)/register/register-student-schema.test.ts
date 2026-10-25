import { describe, expect, it } from "vitest";

import {
  CONFIRM_PASSWORD_MISMATCH_MESSAGE,
  CONFIRM_PASSWORD_REQUIRED_MESSAGE,
  EMAIL_INVALID_MESSAGE,
  EMAIL_REQUIRED_MESSAGE,
  PASSWORD_FORMAT_MESSAGE,
  PASSWORD_REQUIRED_MESSAGE,
} from "./register-schema";
import { classifyRegisterStudentError, registerStudentSchema } from "./register-student-schema";

const validInput = {
  email: "student@gmail.com",
  password: "password1",
  confirmPassword: "password1",
};

const messages = (input: Record<string, string>) => {
  const result = registerStudentSchema.safeParse(input);
  if (result.success) throw new Error("expected validation to fail");
  return result.error.issues.map((issue) => issue.message);
};

describe("registerStudentSchema", () => {
  it("accepts valid input", () => {
    expect(registerStudentSchema.safeParse(validInput).success).toBe(true);
  });

  it("requires every field", () => {
    expect(messages({ email: "", password: "", confirmPassword: "" })).toEqual(
      expect.arrayContaining([
        EMAIL_REQUIRED_MESSAGE,
        PASSWORD_REQUIRED_MESSAGE,
        CONFIRM_PASSWORD_REQUIRED_MESSAGE,
      ])
    );
  });

  it("rejects a malformed email", () => {
    expect(messages({ ...validInput, email: "not-an-email" })).toEqual([EMAIL_INVALID_MESSAGE]);
  });

  it("rejects a password that is too short", () => {
    expect(messages({ ...validInput, password: "short1", confirmPassword: "short1" })).toEqual([
      PASSWORD_FORMAT_MESSAGE,
    ]);
  });

  it("rejects a non-English password", () => {
    expect(messages({ ...validInput, password: "รหัสผ่าน1234", confirmPassword: "x" })).toContain(
      PASSWORD_FORMAT_MESSAGE
    );
  });

  it("rejects mismatched passwords", () => {
    expect(messages({ ...validInput, confirmPassword: "password2" })).toEqual([
      CONFIRM_PASSWORD_MISMATCH_MESSAGE,
    ]);
  });
});

describe("classifyRegisterStudentError", () => {
  it("returns null when there is no error", () => {
    expect(classifyRegisterStudentError(null)).toBeNull();
    expect(classifyRegisterStudentError(undefined)).toBeNull();
  });

  it("maps CONFLICT to email-taken", () => {
    expect(classifyRegisterStudentError({ data: { code: "CONFLICT" } })).toBe("email-taken");
  });

  it("maps anything else to generic", () => {
    expect(classifyRegisterStudentError({ data: { code: "BAD_REQUEST" } })).toBe("generic");
    expect(classifyRegisterStudentError({ data: null })).toBe("generic");
  });
});
