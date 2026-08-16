import { describe, expect, it } from "vitest";
import { generateInviteCode } from "@/server/api/modules/invitations/invite-code";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

describe("generateInviteCode", () => {
  it("defaults to a 6-character code", () => {
    expect(generateInviteCode()).toHaveLength(6);
  });

  it("respects a custom length", () => {
    expect(generateInviteCode(10)).toHaveLength(10);
  });

  it("only uses characters from the fixed alphabet", () => {
    for (let i = 0; i < 200; i++) {
      const code = generateInviteCode();
      for (const char of code) {
        expect(ALPHABET).toContain(char);
      }
    }
  });

  it("satisfies the mailer's invite code format regex", () => {
    for (let i = 0; i < 50; i++) {
      expect(generateInviteCode()).toMatch(/^[A-Za-z0-9_-]+$/);
    }
  });

  it("produces varied output across many calls (smoke check, not a statistical proof)", () => {
    const codes = new Set(Array.from({ length: 500 }, () => generateInviteCode()));
    // 62^6 possible codes — 500 draws colliding even once would be extraordinarily unlikely
    // unless the RNG were badly broken.
    expect(codes.size).toBe(500);
  });
});
