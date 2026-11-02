import { describe, expect, it } from "vitest";
import { resolveAuthErrorRedirect } from "@/app/auth/error/resolve-auth-error-redirect";

describe("resolveAuthErrorRedirect", () => {
  it("sends a signed-in user back to the LINE connect page with the code", () => {
    expect(resolveAuthErrorRedirect({ error: "access_denied", isSignedIn: true })).toBe(
      "/register/student/line?error=access_denied"
    );
  });

  it("sends an anonymous visitor to login with the code", () => {
    expect(resolveAuthErrorRedirect({ error: "access_denied", isSignedIn: false })).toBe(
      "/login?error=access_denied"
    );
  });

  it("falls back to 'unknown' when no code is given", () => {
    expect(resolveAuthErrorRedirect({ error: null, isSignedIn: true })).toBe(
      "/register/student/line?error=unknown"
    );
  });

  it("encodes the code", () => {
    expect(resolveAuthErrorRedirect({ error: "a&b c", isSignedIn: false })).toBe(
      "/login?error=a%26b+c"
    );
  });
});
