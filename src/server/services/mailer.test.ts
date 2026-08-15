import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";

interface EmailPayload {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}

interface SendSuccess {
  data: { id: string } | null;
  error: null;
}

interface SendFailure {
  data: null;
  error: { name: string; statusCode: number | null; message: string };
}

type SendResult = SendSuccess | SendFailure;

const mockSend = vi.hoisted(() => vi.fn<(payload: EmailPayload) => Promise<SendResult>>());

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function MockResend(this: {
    emails: { send: typeof mockSend };
  }) {
    this.emails = { send: mockSend };
  }),
}));

vi.mock("@/config/env", () => ({
  env: {
    APP_BASE_URL: "https://cuatclub.test",
    EMAIL_FROM: "noreply@cuatclub.test",
    RESEND_API_KEY: "test",
  },
}));

import {
  MailDeliveryError,
  MailValidationError,
  sendClubInviteCodeEmail,
} from "@/server/services/mailer";

/** Simulates a resend SDK error shape that carries the original request payload. */
class FakeSdkError extends Error {
  requestPayload: Record<string, unknown>;

  constructor(message: string, requestPayload: Record<string, unknown>) {
    super(message);
    this.name = "FakeSdkError";
    this.requestPayload = requestPayload;
  }
}

const VALID_TO = "club@example.com";
const VALID_CODE = "ABC123";

function successResponse(id = "msg_123"): SendSuccess {
  return { data: { id }, error: null };
}

function errorResponse(
  statusCode: number | null,
  name = "validation_error",
  message = "bad"
): SendFailure {
  return { data: null, error: { name, statusCode, message } };
}

function getSentPayload(): EmailPayload {
  const call = mockSend.mock.calls[0];
  if (!call) throw new Error("emails.send was not called");
  return call[0];
}

describe("sendClubInviteCodeEmail", () => {
  let consoleErrorSpy: MockInstance<typeof console.error>;

  beforeEach(() => {
    mockSend.mockReset();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("happy path", () => {
    it("resolves with messageId and calls emails.send once", async () => {
      mockSend.mockResolvedValueOnce(successResponse("msg_abc"));

      const result = await sendClubInviteCodeEmail({ to: VALID_TO, inviteCode: VALID_CODE });

      expect(result).toEqual({ messageId: "msg_abc" });
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it("renders and sends when clubName is present", async () => {
      mockSend.mockResolvedValueOnce(successResponse());

      await sendClubInviteCodeEmail({
        to: VALID_TO,
        inviteCode: VALID_CODE,
        clubName: "CUAT Club",
      });

      expect(mockSend).toHaveBeenCalledTimes(1);
      const payload = getSentPayload();
      expect(payload.html).toContain("Hi CUAT Club,");
    });

    it("renders and sends when clubName is absent, falling back to 'there'", async () => {
      mockSend.mockResolvedValueOnce(successResponse());

      await sendClubInviteCodeEmail({ to: VALID_TO, inviteCode: VALID_CODE });

      expect(mockSend).toHaveBeenCalledTimes(1);
      const payload = getSentPayload();
      expect(payload.html).toContain("Hi there,");
    });
  });

  describe("recipient rejection", () => {
    const rejectionCases: Array<[string, string]> = [
      ["comma-separated addresses", "a@x.com,b@y.com"],
      ["semicolon-separated addresses", "a@x.com;b@y.com"],
      ["CRLF header injection", "a@x.com\r\nBcc: attacker@evil.com"],
      ["bare-LF header injection", "a@x.com\nBcc: attacker@evil.com"],
      ["multi-@ without deny-listed separator (a@b@x.com)", "a@b@x.com"],
      ["multi-@ without deny-listed separator (display name)", "a@x.com <b@y.com>"],
      ["empty string", ""],
      ["whitespace-padded", "  a@x.com  "],
      ["non-email", "not-an-email"],
      ["too long", `${"a".repeat(250)}@x.com`],
    ];

    it.each(rejectionCases)("rejects %s", async (_label, to) => {
      await expect(sendClubInviteCodeEmail({ to, inviteCode: VALID_CODE })).rejects.toSatisfy(
        (err: unknown) => err instanceof MailValidationError && err.field === "to"
      );
      expect(mockSend).not.toHaveBeenCalled();
    });
  });

  describe("invite code rejection", () => {
    const rejectionCases: Array<[string, string]> = [
      ["empty invite code", ""],
      ["disallowed characters", "abc 123!"],
    ];

    it.each(rejectionCases)("rejects %s", async (_label, inviteCode) => {
      await expect(sendClubInviteCodeEmail({ to: VALID_TO, inviteCode })).rejects.toSatisfy(
        (err: unknown) => err instanceof MailValidationError && err.field === "inviteCode"
      );
      expect(mockSend).not.toHaveBeenCalled();
    });
  });

  describe("club name rejection", () => {
    const rejectionCases: Array<[string, string]> = [
      ["line break", "Sample\nClub"],
      ["too long", "a".repeat(121)],
    ];

    it.each(rejectionCases)("rejects %s", async (_label, clubName) => {
      await expect(
        sendClubInviteCodeEmail({ to: VALID_TO, inviteCode: VALID_CODE, clubName })
      ).rejects.toSatisfy(
        (err: unknown) => err instanceof MailValidationError && err.field === "clubName"
      );
      expect(mockSend).not.toHaveBeenCalled();
    });
  });

  describe("escaping / XSS", () => {
    // Plan test 10 (an inviteCode containing `<script>`, `"`, `'`, `&`, expected to render
    // escaped in the HTML) is not exercisable through the public API: the inviteCode regex
    // (`^[A-Za-z0-9_-]+$`, see "invite code rejection" above) always rejects those characters
    // before the template is ever built. See final report for this gap.

    it("escapes a club name containing an XSS payload", async () => {
      mockSend.mockResolvedValueOnce(successResponse());
      const clubName = `"><img src=x onerror=alert(1)>`;

      await sendClubInviteCodeEmail({ to: VALID_TO, inviteCode: VALID_CODE, clubName });

      const payload = getSentPayload();
      expect(payload.html).not.toContain("<img src=x onerror=alert(1)>");
      expect(payload.html).toContain("&quot;&gt;&lt;img");
    });

    it("keeps the escaped register URL identical at both the href and visible-text sites", async () => {
      mockSend.mockResolvedValueOnce(successResponse());

      await sendClubInviteCodeEmail({ to: VALID_TO, inviteCode: VALID_CODE });

      const payload = getSentPayload();
      const url = new URL("/register", "https://cuatclub.test");
      url.searchParams.set("inviteCode", VALID_CODE);
      const expectedHtml = url
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

      // The approved template (invite-email-template.html) uses {{REGISTER_URL}} three times:
      // the CTA button href, the fallback-link href, and the fallback visible text — not twice
      // as the plan's test 12 describes. The template is authoritative; see final report.
      const occurrences = payload.html.split(expectedHtml).length - 1;
      expect(occurrences).toBe(3);
      expect(payload.html).toContain(`href="${expectedHtml}"`);
      expect(payload.html).toContain(`>${expectedHtml}<`);
    });

    it("renders the text part with the raw unescaped URL and no HTML entities", async () => {
      mockSend.mockResolvedValueOnce(successResponse());

      await sendClubInviteCodeEmail({ to: VALID_TO, inviteCode: VALID_CODE });

      const payload = getSentPayload();
      const url = new URL("/register", "https://cuatclub.test");
      url.searchParams.set("inviteCode", VALID_CODE);

      expect(payload.text).toContain(url.toString());
      expect(payload.text).not.toMatch(/&amp;|&lt;|&gt;|&quot;|&#39;/);
    });
  });

  describe("URL construction", () => {
    // Plan test 14 also calls for "a code containing &, =, or a space round-trips correctly
    // encoded" — not exercisable through the public API for the same reason as the inviteCode
    // XSS case above: the inviteCode regex rejects those characters before URL construction
    // runs. See final report for this gap.
    it("builds a register URL with the correct origin, path and inviteCode param", async () => {
      mockSend.mockResolvedValueOnce(successResponse());

      await sendClubInviteCodeEmail({ to: VALID_TO, inviteCode: VALID_CODE });

      const payload = getSentPayload();
      const url = new URL("/register", "https://cuatclub.test");
      url.searchParams.set("inviteCode", VALID_CODE);
      expect(payload.text).toContain(url.toString());
      expect(url.origin).toBe("https://cuatclub.test");
      expect(url.pathname).toBe("/register");
      expect(url.searchParams.get("inviteCode")).toBe(VALID_CODE);
    });
  });

  describe("logging / PII", () => {
    it("does not leak the invite code via console.error on provider failure", async () => {
      const inviteCode = "SECRETCODE";
      mockSend.mockRejectedValueOnce(
        new FakeSdkError("network error", { html: "<html>irrelevant</html>", inviteCode })
      );

      await expect(sendClubInviteCodeEmail({ to: VALID_TO, inviteCode })).rejects.toBeInstanceOf(
        MailDeliveryError
      );

      const logged = JSON.stringify(consoleErrorSpy.mock.calls);
      expect(logged).not.toContain(inviteCode);
    });

    it("does not leak the rendered HTML or full register URL via console.error", async () => {
      mockSend.mockRejectedValueOnce(
        new FakeSdkError("network error", { html: "<html>irrelevant</html>" })
      );

      await expect(
        sendClubInviteCodeEmail({ to: VALID_TO, inviteCode: VALID_CODE })
      ).rejects.toBeInstanceOf(MailDeliveryError);

      const url = new URL("/register", "https://cuatclub.test");
      url.searchParams.set("inviteCode", VALID_CODE);
      const logged = JSON.stringify(consoleErrorSpy.mock.calls);
      expect(logged).not.toContain("<html>");
      expect(logged).not.toContain(url.toString());
    });

    it("logs the masked recipient and never the full recipient address", async () => {
      mockSend.mockResolvedValueOnce(errorResponse(400));

      await expect(
        sendClubInviteCodeEmail({ to: VALID_TO, inviteCode: VALID_CODE })
      ).rejects.toBeInstanceOf(MailDeliveryError);

      const logged = JSON.stringify(consoleErrorSpy.mock.calls);
      expect(logged).toContain("c***@example.com");
      expect(logged).not.toContain(VALID_TO);
    });

    it("does not call console.error on success", async () => {
      mockSend.mockResolvedValueOnce(successResponse());

      await sendClubInviteCodeEmail({ to: VALID_TO, inviteCode: VALID_CODE });

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe("error mapping", () => {
    it("maps a non-null res.error to a non-retryable MailDeliveryError", async () => {
      mockSend.mockResolvedValueOnce(errorResponse(400));

      await expect(
        sendClubInviteCodeEmail({ to: VALID_TO, inviteCode: VALID_CODE })
      ).rejects.toSatisfy(
        (err: unknown) =>
          err instanceof MailDeliveryError &&
          err.retryable === false &&
          err.providerName === "resend"
      );
    });

    it("maps a 4xx statusCode to retryable: false", async () => {
      mockSend.mockResolvedValueOnce(errorResponse(422));

      await expect(
        sendClubInviteCodeEmail({ to: VALID_TO, inviteCode: VALID_CODE })
      ).rejects.toSatisfy((err: unknown) => err instanceof MailDeliveryError && !err.retryable);
    });

    it("maps a 429 statusCode to retryable: true", async () => {
      mockSend.mockResolvedValueOnce(errorResponse(429));

      await expect(
        sendClubInviteCodeEmail({ to: VALID_TO, inviteCode: VALID_CODE })
      ).rejects.toSatisfy((err: unknown) => err instanceof MailDeliveryError && err.retryable);
    });

    it("maps a 5xx statusCode to retryable: true", async () => {
      mockSend.mockResolvedValueOnce(errorResponse(503));

      await expect(
        sendClubInviteCodeEmail({ to: VALID_TO, inviteCode: VALID_CODE })
      ).rejects.toSatisfy((err: unknown) => err instanceof MailDeliveryError && err.retryable);
    });

    it("maps a thrown network error to retryable: true", async () => {
      mockSend.mockRejectedValueOnce(new Error("ECONNRESET"));

      await expect(
        sendClubInviteCodeEmail({ to: VALID_TO, inviteCode: VALID_CODE })
      ).rejects.toSatisfy((err: unknown) => err instanceof MailDeliveryError && err.retryable);
    });

    it("maps a success shape with missing data.id to MailDeliveryError", async () => {
      mockSend.mockResolvedValueOnce({ data: null, error: null });

      await expect(
        sendClubInviteCodeEmail({ to: VALID_TO, inviteCode: VALID_CODE })
      ).rejects.toBeInstanceOf(MailDeliveryError);
    });

    it("does not internally retry: emails.send is called exactly once on failure", async () => {
      mockSend.mockResolvedValueOnce(errorResponse(500));

      await expect(
        sendClubInviteCodeEmail({ to: VALID_TO, inviteCode: VALID_CODE })
      ).rejects.toBeInstanceOf(MailDeliveryError);

      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });

  describe("payload invariants", () => {
    it("sends a safe subject, single-string `to`, correct `from`, and non-empty html/text", async () => {
      mockSend.mockResolvedValueOnce(successResponse());

      await sendClubInviteCodeEmail({ to: VALID_TO, inviteCode: VALID_CODE });

      const payload = getSentPayload();
      expect(payload.subject).not.toContain(VALID_CODE);
      expect(payload.to).toBe(VALID_TO);
      expect(Array.isArray(payload.to)).toBe(false);
      expect(payload.from).toBe("CUATClub <noreply@cuatclub.test>");
      expect(payload.html.length).toBeGreaterThan(0);
      expect(payload.text.length).toBeGreaterThan(0);
    });
  });
});
