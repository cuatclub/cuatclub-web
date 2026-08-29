import { describe, expect, it } from "vitest";

import {
  classifyAuthError,
  EMAIL_INVALID_MESSAGE,
  EMAIL_REQUIRED_MESSAGE,
  loginSchema,
  PASSWORD_FORMAT_MESSAGE,
  PASSWORD_REQUIRED_MESSAGE,
} from "./login-schema";

const firstMessage = (result: ReturnType<typeof loginSchema.safeParse>) => {
  if (result.success) throw new Error("expected validation to fail");
  return result.error.issues[0]?.message;
};

describe("loginSchema", () => {
  it("accepts a valid email + password", () => {
    const result = loginSchema.safeParse({ email: "student@gmail.com", password: "password1" });
    expect(result.success).toBe(true);
  });

  it("trims the email", () => {
    const result = loginSchema.safeParse({
      email: "  student@gmail.com  ",
      password: "password1",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("student@gmail.com");
  });

  it("rejects an empty email", () => {
    const result = loginSchema.safeParse({ email: "", password: "password1" });
    expect(firstMessage(result)).toBe(EMAIL_REQUIRED_MESSAGE);
  });

  it("rejects a malformed email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "password1" });
    expect(firstMessage(result)).toBe(EMAIL_INVALID_MESSAGE);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "student@gmail.com", password: "" });
    expect(firstMessage(result)).toBe(PASSWORD_REQUIRED_MESSAGE);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = loginSchema.safeParse({ email: "student@gmail.com", password: "short1" });
    expect(firstMessage(result)).toBe(PASSWORD_FORMAT_MESSAGE);
  });

  it("rejects a password containing non-English characters", () => {
    const result = loginSchema.safeParse({ email: "student@gmail.com", password: "รหัสผ่าน1" });
    expect(firstMessage(result)).toBe(PASSWORD_FORMAT_MESSAGE);
  });

  it("accepts an 8-character ASCII password", () => {
    const result = loginSchema.safeParse({ email: "student@gmail.com", password: "abcd1234" });
    expect(result.success).toBe(true);
  });
});

describe("classifyAuthError", () => {
  it("treats a missing error as success", () => {
    expect(classifyAuthError(null)).toBeNull();
    expect(classifyAuthError(undefined)).toBeNull();
  });

  // The one branch a mislabel here is most costly: telling a user their
  // password is wrong when the real cause was a 500 or a network failure.
  it("classifies Better Auth's invalid-credentials code correctly", () => {
    expect(classifyAuthError({ code: "INVALID_EMAIL_OR_PASSWORD" })).toBe("invalid-credentials");
  });

  it("falls back to generic for any other error code", () => {
    expect(classifyAuthError({ code: "INTERNAL_SERVER_ERROR" })).toBe("generic");
    expect(classifyAuthError({ code: "TOO_MANY_REQUESTS" })).toBe("generic");
  });

  it("falls back to generic when there's no code at all", () => {
    expect(classifyAuthError({})).toBe("generic");
  });
});
