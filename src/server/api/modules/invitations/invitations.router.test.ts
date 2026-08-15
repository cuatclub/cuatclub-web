import { beforeEach, describe, expect, it, vi } from "vitest";

// Importing the real appRouter (via root.ts) pulls in the whole server module graph —
// auth, db, every other module's repositories. Mock the boundary modules that would
// otherwise try to open a real DB connection / build a real better-auth instance, and mock
// this router's own usecase so the test stays scoped to the adminProcedure gate, not the
// business logic (that's covered by generate-invitation-code.usecase.test.ts).
vi.mock("@/server/db", () => ({ db: {} }));
vi.mock("@/server/auth", () => ({ auth: { api: { getSession: vi.fn() } } }));

const mockGenerateInvitationCode = vi.hoisted(() => vi.fn());
vi.mock("@/server/api/modules/invitations/usecases", () => ({
  generateInvitationCode: mockGenerateInvitationCode,
}));

import { createCaller } from "@/server/api/root";

type Ctx = Parameters<typeof createCaller>[0];

function ctxFor(role: "STUDENT" | "CLUB" | "ADMIN" | null): Ctx {
  if (role === null) {
    return { session: null, headers: new Headers() } as unknown as Ctx;
  }
  return {
    session: { user: { id: "user-1", role } },
    headers: new Headers(),
  } as unknown as Ctx;
}

const VALID_INPUT = { email: "club@example.com" };

describe("invitationsRouter.generate", () => {
  beforeEach(() => {
    mockGenerateInvitationCode.mockReset();
  });

  it("rejects an unauthenticated caller with UNAUTHORIZED", async () => {
    const caller = createCaller(ctxFor(null));

    await expect(caller.invitations.generate(VALID_INPUT)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    expect(mockGenerateInvitationCode).not.toHaveBeenCalled();
  });

  it("rejects a signed-in non-admin caller with FORBIDDEN", async () => {
    const caller = createCaller(ctxFor("STUDENT"));

    await expect(caller.invitations.generate(VALID_INPUT)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect(mockGenerateInvitationCode).not.toHaveBeenCalled();
  });

  it("allows an admin caller through to the usecase", async () => {
    mockGenerateInvitationCode.mockResolvedValueOnce({
      email: VALID_INPUT.email,
      expiredAt: new Date(),
      createdAt: new Date(),
    });
    const caller = createCaller(ctxFor("ADMIN"));

    const result = await caller.invitations.generate(VALID_INPUT);

    expect(mockGenerateInvitationCode).toHaveBeenCalledWith(VALID_INPUT);
    expect(result.email).toBe(VALID_INPUT.email);
  });
});
