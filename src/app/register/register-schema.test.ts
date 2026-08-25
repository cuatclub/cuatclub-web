import { describe, expect, it } from "vitest";

import {
  classifyRegisterClubError,
  CONFIRM_PASSWORD_MISMATCH_MESSAGE,
  CONFIRM_PASSWORD_REQUIRED_MESSAGE,
  EMAIL_INVALID_MESSAGE,
  EMAIL_REQUIRED_MESSAGE,
  INVITATION_CODE_FORMAT_MESSAGE,
  INVITATION_CODE_REQUIRED_MESSAGE,
  PASSWORD_FORMAT_MESSAGE,
  PASSWORD_REQUIRED_MESSAGE,
  registerClubSchema,
} from "./register-schema";

const validInput = {
  invitationCode: "ABC123",
  email: "club@gmail.com",
  password: "password1",
  confirmPassword: "password1",
};

const firstMessage = (result: ReturnType<typeof registerClubSchema.safeParse>) => {
  if (result.success) throw new Error("expected validation to fail");
  return result.error.issues[0]?.message;
};

describe("registerClubSchema", () => {
  it("accepts valid input", () => {
    const result = registerClubSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("trims the invitation code and email", () => {
    const result = registerClubSchema.safeParse({
      ...validInput,
      invitationCode: "  ABC123  ",
      email: "  club@gmail.com  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.invitationCode).toBe("ABC123");
      expect(result.data.email).toBe("club@gmail.com");
    }
  });

  it("rejects an empty invitation code", () => {
    const result = registerClubSchema.safeParse({ ...validInput, invitationCode: "" });
    expect(firstMessage(result)).toBe(INVITATION_CODE_REQUIRED_MESSAGE);
  });

  it("rejects an invitation code shorter than 6 characters", () => {
    const result = registerClubSchema.safeParse({ ...validInput, invitationCode: "ABC12" });
    expect(firstMessage(result)).toBe(INVITATION_CODE_FORMAT_MESSAGE);
  });

  it("rejects an invitation code longer than 6 characters", () => {
    const result = registerClubSchema.safeParse({ ...validInput, invitationCode: "ABC1234" });
    expect(firstMessage(result)).toBe(INVITATION_CODE_FORMAT_MESSAGE);
  });

  it("rejects an empty email", () => {
    const result = registerClubSchema.safeParse({ ...validInput, email: "" });
    expect(firstMessage(result)).toBe(EMAIL_REQUIRED_MESSAGE);
  });

  it("rejects a malformed email", () => {
    const result = registerClubSchema.safeParse({ ...validInput, email: "not-an-email" });
    expect(firstMessage(result)).toBe(EMAIL_INVALID_MESSAGE);
  });

  it("rejects an empty password", () => {
    const result = registerClubSchema.safeParse({
      ...validInput,
      password: "",
      confirmPassword: "",
    });
    expect(firstMessage(result)).toBe(PASSWORD_REQUIRED_MESSAGE);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = registerClubSchema.safeParse({
      ...validInput,
      password: "short1",
      confirmPassword: "short1",
    });
    expect(firstMessage(result)).toBe(PASSWORD_FORMAT_MESSAGE);
  });

  it("rejects a password containing non-English characters", () => {
    const result = registerClubSchema.safeParse({
      ...validInput,
      password: "รหัสผ่าน1",
      confirmPassword: "รหัสผ่าน1",
    });
    expect(firstMessage(result)).toBe(PASSWORD_FORMAT_MESSAGE);
  });

  it("accepts an 8-character ASCII password", () => {
    const result = registerClubSchema.safeParse({
      ...validInput,
      password: "abcd1234",
      confirmPassword: "abcd1234",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty confirm password", () => {
    const result = registerClubSchema.safeParse({ ...validInput, confirmPassword: "" });
    expect(firstMessage(result)).toBe(CONFIRM_PASSWORD_REQUIRED_MESSAGE);
  });

  it("rejects a confirm password that doesn't match", () => {
    const result = registerClubSchema.safeParse({ ...validInput, confirmPassword: "different1" });
    expect(firstMessage(result)).toBe(CONFIRM_PASSWORD_MISMATCH_MESSAGE);
  });
});

describe("classifyRegisterClubError", () => {
  it("treats a missing error as success", () => {
    expect(classifyRegisterClubError(null)).toBeNull();
    expect(classifyRegisterClubError(undefined)).toBeNull();
  });

  it("classifies a CONFLICT as an already-used email", () => {
    expect(classifyRegisterClubError({ data: { code: "CONFLICT" } })).toBe("email-taken");
  });

  it("classifies a domain BAD_REQUEST (no zodError) as a code/email mismatch", () => {
    expect(classifyRegisterClubError({ data: { code: "BAD_REQUEST" } })).toBe("code-mismatch");
  });

  // A BAD_REQUEST carrying a zodError means the client schema was bypassed,
  // not that the invite code/email pair mismatched — don't blame the code.
  it("falls back to generic for a BAD_REQUEST that carries a zodError", () => {
    expect(
      classifyRegisterClubError({ data: { code: "BAD_REQUEST", zodError: { fieldErrors: {} } } })
    ).toBe("generic");
  });

  it("falls back to generic for any other error code", () => {
    expect(classifyRegisterClubError({ data: { code: "INTERNAL_SERVER_ERROR" } })).toBe("generic");
  });

  it("falls back to generic when there's no code at all", () => {
    expect(classifyRegisterClubError({ data: {} })).toBe("generic");
    expect(classifyRegisterClubError({})).toBe("generic");
  });
});
