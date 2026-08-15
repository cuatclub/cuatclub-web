import { beforeEach, describe, expect, it, vi } from "vitest";

const { FakeMailValidationError, FakeMailDeliveryError } = vi.hoisted(() => {
  class FakeMailValidationError extends Error {
    readonly field: "to" | "inviteCode" | "clubName";
    constructor(field: "to" | "inviteCode" | "clubName", message: string) {
      super(message);
      this.name = "MailValidationError";
      this.field = field;
    }
  }

  class FakeMailDeliveryError extends Error {
    readonly retryable: boolean;
    readonly providerName: string;
    constructor(message: string, retryable: boolean, providerName: string) {
      super(message);
      this.name = "MailDeliveryError";
      this.retryable = retryable;
      this.providerName = providerName;
    }
  }

  return { FakeMailValidationError, FakeMailDeliveryError };
});

const mockInvalidateActiveByEmail = vi.hoisted(() => vi.fn());
const mockCreate = vi.hoisted(() => vi.fn());
const mockSendClubInviteCodeEmail = vi.hoisted(() => vi.fn());
const mockUnitOfWorkRun = vi.hoisted(() =>
  vi.fn(async (fn: (client: unknown) => Promise<unknown>) => fn({}))
);

vi.mock("@/server/api/modules/invitations/invitation-codes.repository", () => ({
  invitationCodesRepository: {
    invalidateActiveByEmail: mockInvalidateActiveByEmail,
    create: mockCreate,
  },
}));

vi.mock("@/server/db/unit-of-work", () => ({
  unitOfWork: { run: mockUnitOfWorkRun },
}));

vi.mock("@/server/services/mailer", () => ({
  sendClubInviteCodeEmail: mockSendClubInviteCodeEmail,
  MailValidationError: FakeMailValidationError,
  MailDeliveryError: FakeMailDeliveryError,
}));

import { generateInvitationCode } from "@/server/api/modules/invitations/usecases/generate-invitation-code.usecase";

const VALID_EMAIL = "club@example.com";

function fakeInvitationCodeEntity(overrides: Partial<{ email: string; inviteCode: string }> = {}) {
  const email = overrides.email ?? VALID_EMAIL;
  const inviteCode = overrides.inviteCode ?? "ABC234";
  const expiredAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const createdAt = new Date();
  return {
    email,
    inviteCode,
    expiredAt,
    createdAt,
    toDTO: () => ({ email, expiredAt, createdAt }),
  };
}

describe("generateInvitationCode", () => {
  beforeEach(() => {
    mockInvalidateActiveByEmail.mockReset();
    mockCreate.mockReset();
    mockSendClubInviteCodeEmail.mockReset();
    mockUnitOfWorkRun.mockClear();
  });

  it("invalidates any prior active code before creating the new one, inside the same unit of work", async () => {
    const entity = fakeInvitationCodeEntity();
    const callOrder: string[] = [];
    mockInvalidateActiveByEmail.mockImplementation(async () => {
      callOrder.push("invalidate");
    });
    mockCreate.mockImplementation(async () => {
      callOrder.push("create");
      return entity;
    });
    mockSendClubInviteCodeEmail.mockResolvedValueOnce({ messageId: "msg_1" });

    await generateInvitationCode({ email: VALID_EMAIL });

    expect(mockUnitOfWorkRun).toHaveBeenCalledTimes(1);
    expect(callOrder).toEqual(["invalidate", "create"]);
  });

  it("sends the email using the persisted row's email/inviteCode, not raw input, and returns the DTO", async () => {
    const entity = fakeInvitationCodeEntity({ email: VALID_EMAIL, inviteCode: "XYZ789" });
    mockInvalidateActiveByEmail.mockResolvedValueOnce(undefined);
    mockCreate.mockResolvedValueOnce(entity);
    mockSendClubInviteCodeEmail.mockResolvedValueOnce({ messageId: "msg_1" });

    const result = await generateInvitationCode({ email: VALID_EMAIL, clubName: "Chess Club" });

    expect(mockSendClubInviteCodeEmail).toHaveBeenCalledWith({
      to: VALID_EMAIL,
      inviteCode: "XYZ789",
      clubName: "Chess Club",
    });
    expect(result).toEqual({
      email: entity.email,
      expiredAt: entity.expiredAt,
      createdAt: entity.createdAt,
    });
  });

  it("sets a 14-day expiry on the created code", async () => {
    const entity = fakeInvitationCodeEntity();
    mockInvalidateActiveByEmail.mockResolvedValueOnce(undefined);
    mockCreate.mockResolvedValueOnce(entity);
    mockSendClubInviteCodeEmail.mockResolvedValueOnce({ messageId: "msg_1" });

    await generateInvitationCode({ email: VALID_EMAIL });

    const [createArgs] = mockCreate.mock.calls[0] as [{ email: string; expiredAt: Date }];
    const ttlMs = createArgs.expiredAt.getTime() - Date.now();
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
    expect(Math.abs(ttlMs - fourteenDaysMs)).toBeLessThan(5000);
  });

  it("does not delete the committed row and rethrows as a TRPCError when the mail provider rejects the send", async () => {
    const entity = fakeInvitationCodeEntity();
    mockInvalidateActiveByEmail.mockResolvedValueOnce(undefined);
    mockCreate.mockResolvedValueOnce(entity);
    mockSendClubInviteCodeEmail.mockRejectedValueOnce(
      new FakeMailValidationError("to", "Invalid recipient email address.")
    );

    await expect(generateInvitationCode({ email: VALID_EMAIL })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
  });

  it("does not delete the committed row and rethrows as a TRPCError when delivery fails", async () => {
    const entity = fakeInvitationCodeEntity();
    mockInvalidateActiveByEmail.mockResolvedValueOnce(undefined);
    mockCreate.mockResolvedValueOnce(entity);
    mockSendClubInviteCodeEmail.mockRejectedValueOnce(
      new FakeMailDeliveryError("Unable to send email right now.", true, "resend")
    );

    await expect(generateInvitationCode({ email: VALID_EMAIL })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
  });

  it("propagates unexpected errors from the mailer unchanged", async () => {
    const entity = fakeInvitationCodeEntity();
    mockInvalidateActiveByEmail.mockResolvedValueOnce(undefined);
    mockCreate.mockResolvedValueOnce(entity);
    const unexpected = new Error("boom");
    mockSendClubInviteCodeEmail.mockRejectedValueOnce(unexpected);

    await expect(generateInvitationCode({ email: VALID_EMAIL })).rejects.toBe(unexpected);
  });
});
