import { describe, expect, it } from "vitest";

import { RegisterClubInputDTOSchema } from "@/server/api/modules/clubs/dto/register-club.dto";

const validInput = {
  inviteCode: "AB12CD",
  email: "club@example.com",
  password: "password1",
  confirmPassword: "password1",
};

const parse = (over: Partial<typeof validInput> = {}) =>
  RegisterClubInputDTOSchema.safeParse({ ...validInput, ...over });

describe("RegisterClubInputDTOSchema", () => {
  it("accepts valid input", () => {
    expect(parse().success).toBe(true);
  });

  // Both normalisations exist because the values are compared against stored data with strict
  // equality: better-auth stores emails lowercased, and invitation codes are generated from an
  // uppercase-only alphabet. Getting either wrong produces a registration that looks valid but
  // is rejected, or one that succeeds and can never sign in.
  describe("normalisation", () => {
    it("lowercases the email", () => {
      const result = parse({ email: "Club.Name@Example.COM" });
      expect(result.success && result.data.email).toBe("club.name@example.com");
    });

    it("uppercases the invitation code", () => {
      const result = parse({ inviteCode: "ab12cd" });
      expect(result.success && result.data.inviteCode).toBe("AB12CD");
    });
  });

  describe("invitation code", () => {
    it.each([
      ["too short", "AB12C"],
      ["too long", "AB12CDE"],
      ["empty", ""],
    ])("rejects a code that is %s", (_label, inviteCode) => {
      expect(parse({ inviteCode }).success).toBe(false);
    });
  });

  describe("email", () => {
    it.each([
      ["missing", ""],
      ["malformed", "not-an-email"],
    ])("rejects an email that is %s", (_label, email) => {
      expect(parse({ email }).success).toBe(false);
    });
  });

  describe("password", () => {
    it("rejects fewer than 8 characters", () => {
      expect(parse({ password: "short1", confirmPassword: "short1" }).success).toBe(false);
    });

    it("rejects non-English characters", () => {
      expect(parse({ password: "รหัสผ่านยาว", confirmPassword: "รหัสผ่านยาว" }).success).toBe(
        false
      );
    });

    it("accepts exactly 8 printable ASCII characters", () => {
      expect(parse({ password: "Pa55w0rd", confirmPassword: "Pa55w0rd" }).success).toBe(true);
    });

    it("rejects a mismatched confirmation", () => {
      const result = parse({ confirmPassword: "password2" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(["confirmPassword"]);
      }
    });
  });
});
