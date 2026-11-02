import { describe, expect, it } from "vitest";
import {
  getLineConnectErrorMessage,
  LINE_ALREADY_LINKED_MESSAGE,
  LINE_CONNECT_CANCELLED_MESSAGE,
  LINE_CONNECT_FAILED_MESSAGE,
} from "@/app/(site)/register/student/line/_lib/line-connect-error";

describe("getLineConnectErrorMessage", () => {
  it("shows nothing without an error code", () => {
    expect(getLineConnectErrorMessage(undefined)).toBeNull();
  });

  it("explains a cancelled consent screen", () => {
    expect(getLineConnectErrorMessage("access_denied")).toBe(LINE_CONNECT_CANCELLED_MESSAGE);
  });

  it("explains a LINE account that belongs to another user", () => {
    expect(getLineConnectErrorMessage("account_already_linked_to_different_user")).toBe(
      LINE_ALREADY_LINKED_MESSAGE
    );
  });

  it.each(["email_doesn't_match", "oauth_code_verification_failed", "unknown"])(
    "falls back to the generic message for %s",
    (code) => {
      expect(getLineConnectErrorMessage(code)).toBe(LINE_CONNECT_FAILED_MESSAGE);
    }
  );
});
