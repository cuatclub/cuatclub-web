import { LINE_CONNECT_PATH } from "@/lib/line";

/**
 * Where better-auth's OAuth error landing sends the user. Link flows always have a session and
 * sign-in flows never do, so a signed-in user is retrying the LINE connect step and an anonymous
 * one is back at login.
 */
export function resolveAuthErrorRedirect({
  error,
  isSignedIn,
}: {
  error: string | null;
  isSignedIn: boolean;
}): string {
  const path = isSignedIn ? LINE_CONNECT_PATH : "/login";
  return `${path}?${new URLSearchParams({ error: error ?? "unknown" }).toString()}`;
}
