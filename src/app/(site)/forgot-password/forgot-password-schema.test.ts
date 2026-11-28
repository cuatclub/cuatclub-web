import { describe, expect, it } from "vitest";

import { GENERIC_ERROR_MESSAGE } from "@/app/(site)/login/login-schema";
import { EMAIL_SEND_FAILED_CODE, USER_NOT_FOUND_CODE } from "@/lib/password-reset";
import {
  describeForgotPasswordError,
  EMAIL_SEND_FAILED_MESSAGE,
  TOO_MANY_REQUESTS_MESSAGE,
  USER_NOT_FOUND_MESSAGE,
} from "./forgot-password-schema";

describe("describeForgotPasswordError", () => {
  it("puts an unknown email on the email field", () => {
    expect(describeForgotPasswordError({ status: 404, code: USER_NOT_FOUND_CODE })).toEqual({
      field: "email",
      message: USER_NOT_FOUND_MESSAGE,
    });
  });

  it.each([
    [{ status: 429 }, TOO_MANY_REQUESTS_MESSAGE],
    [{ status: 502, code: EMAIL_SEND_FAILED_CODE }, EMAIL_SEND_FAILED_MESSAGE],
    [{ status: 500 }, GENERIC_ERROR_MESSAGE],
  ])("reports %o on the form", (error, message) => {
    expect(describeForgotPasswordError(error)).toEqual({ field: "root", message });
  });
});
