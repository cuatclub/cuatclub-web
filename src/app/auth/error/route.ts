import { NextResponse, type NextRequest } from "next/server";
import { resolveAuthErrorRedirect } from "@/app/auth/error/resolve-auth-error-redirect";
import { auth } from "@/server/auth";

/** better-auth's `onAPIError.errorURL`: OAuth failures land here and are sent back to the right page. */
export async function GET(request: NextRequest) {
  const error = request.nextUrl.searchParams.get("error");
  const isSignedIn = !!(await auth.api.getSession({ headers: request.headers }));

  return NextResponse.redirect(
    new URL(resolveAuthErrorRedirect({ error, isSignedIn }), request.url)
  );
}
