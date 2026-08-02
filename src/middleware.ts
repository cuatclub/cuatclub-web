/**
 * Edge auth: session cookie, login/home entry, and onboarding completion.
 * Role checks for app areas live in route-group layouts via `requireRole` (see `src/lib/require-role.ts`).
 */
import { type NextRequest, NextResponse } from "next/server";
import { getCookieCache } from "better-auth/cookies";
import {
	ATTENDEE_LOGIN_PATH,
	defaultHomePathForRole,
	pendingOnboardingPath,
	type SessionUserLike,
} from "@/lib/auth-paths";

/** Better Auth: http dev uses `better-auth.session_token`; https (e.g. Vercel) uses `__Secure-better-auth.session_token`. */
const SESSION_COOKIE_PLAIN = "better-auth.session_token";
const SESSION_COOKIE_SECURE = "__Secure-better-auth.session_token";

function hasBetterAuthSessionCookie(request: NextRequest): boolean {
	return (
		request.cookies.has(SESSION_COOKIE_PLAIN) ||
		request.cookies.has(SESSION_COOKIE_SECURE)
	);
}

/** Avoid 307 loops when the destination is already the current path. */
function redirectIfDifferent(request: NextRequest, path: string) {
	const target = new URL(path, request.url);
	if (target.pathname === request.nextUrl.pathname) {
		return NextResponse.next();
	}
	return NextResponse.redirect(target);
}

async function getSessionUser(request: NextRequest): Promise<SessionUserLike | null> {
	const cookieHeader = request.headers.get("cookie");
	if (!cookieHeader) return null;

	const cached = await getCookieCache(request);
	const cachedUser = cached?.user as SessionUserLike | undefined;
	// Cookie cache can omit `role`; middleware needs it for home/onboarding. Prefer full session when role is missing.
	if (cachedUser && cachedUser.role) {
		return cachedUser;
	}

	const res = await fetch(new URL("/api/auth/get-session", request.url), {
		headers: { cookie: cookieHeader },
		cache: "no-store",
	});
	if (!res.ok) return cachedUser ?? null;
	const data = (await res.json()) as { user?: SessionUserLike } | null;
	return data?.user ?? cachedUser ?? null;
}

export async function middleware(request: NextRequest) {
// 	const { pathname } = request.nextUrl;
// 	const hasSession = hasBetterAuthSessionCookie(request);
// 	const loginUrl = new URL(ATTENDEE_LOGIN_PATH, request.url);

// 	if (pathname === "/auth" && !hasSession) {
// 		return NextResponse.redirect(loginUrl);
// 	}

// 	if (pathname.startsWith("/posts")) {
// 		if (!hasSession) {
// 			return NextResponse.redirect(new URL("/", request.url));
// 		}
// 	}

// 	if (pathname.startsWith("/auth/attendee/onboarding") || pathname.startsWith("/auth/organizer/onboarding")) {
// 		if (!hasSession) {
// 			return NextResponse.redirect(loginUrl);
// 		}
// 		return NextResponse.next();
// 	}

// 	if (
// 		pathname.startsWith("/feed") ||
// 		pathname.startsWith("/clubs") ||
// 		pathname.startsWith("/calendar") ||
// 		pathname.startsWith("/profile") ||
// 		pathname.startsWith("/admin") ||
// 		pathname.startsWith("/create") ||
// 		pathname.startsWith("/posts")
// 	) {
// 		if (!hasSession) {
// 			return NextResponse.redirect(loginUrl);
// 		}
// 	}

// 	const user = hasSession ? await getSessionUser(request) : null;
// 	const onboardingTarget = pendingOnboardingPath(user);

// 	if (pathname === "/") {
// 		if (!hasSession) {
// 			return NextResponse.redirect(loginUrl);
// 		}
// 		if (onboardingTarget) {
// 			return NextResponse.redirect(new URL(onboardingTarget, request.url));
// 		}
// 		return redirectIfDifferent(request, defaultHomePathForRole(user?.role));
// 	}

// 	const isLoginPage =
// 		pathname === "/auth" ||
// 		pathname.startsWith("/auth/attendee/login") ||
// 		pathname.startsWith("/auth/organizer/login");

// 	if (isLoginPage && hasSession) {
// 		if (onboardingTarget) {
// 			return NextResponse.redirect(new URL(onboardingTarget, request.url));
// 		}
// 		return redirectIfDifferent(request, defaultHomePathForRole(user?.role));
// 	}

// 	if (hasSession && onboardingTarget && !pathname.startsWith(onboardingTarget)) {
// 		return NextResponse.redirect(new URL(onboardingTarget, request.url));
// 	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
