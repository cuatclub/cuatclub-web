import { describe, expect, it } from "vitest";

import {
  CONFIRM_PASSWORD_MISMATCH_MESSAGE,
  PASSWORD_FORMAT_MESSAGE,
} from "@/app/(site)/register/register-schema";
import { resetPasswordSchema } from "./reset-password-schema";

const issueMessages = (password: string, confirmPassword: string) =>
  resetPasswordSchema
    .safeParse({ password, confirmPassword })
    .error?.issues.map((issue) => issue.message) ?? [];

describe("resetPasswordSchema", () => {
  it("accepts a matching password of at least 8 characters", () => {
    expect(issueMessages("password1", "password1")).toEqual([]);
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(issueMessages("short", "short")).toContain(PASSWORD_FORMAT_MESSAGE);
  });

  it("rejects a confirmation that does not match", () => {
    expect(issueMessages("password1", "password2")).toContain(CONFIRM_PASSWORD_MISMATCH_MESSAGE);
  });
});
