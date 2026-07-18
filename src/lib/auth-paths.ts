export const ATTENDEE_ONBOARDING_PATH = "/auth/attendee/onboarding";
export const ORGANIZER_ONBOARDING_PATH = "/auth/organizer/onboarding";
export const ATTENDEE_LOGIN_PATH = "/auth/attendee/login";

export type SessionUserLike = {
	role?: string;
	onboardingComplete?: boolean;
};

/** Where this user must be if onboarding is not finished; null = no redirect. */
export function pendingOnboardingPath(user: SessionUserLike | null): string | null {
	if (!user?.role) return null;
	if (user.role !== "ORGANIZATION" && user.role !== "ATTENDEE") return null;
	if (user.onboardingComplete === true) return null;
	return user.role === "ORGANIZATION" ? ORGANIZER_ONBOARDING_PATH : ATTENDEE_ONBOARDING_PATH;
}

export function defaultHomePathForRole(role: string | undefined): string {
	if (role === "ATTENDEE") return "/feed";
	if (role === "ORGANIZATION") return "/posts";
	if (role === "ADMIN") return "/admin/list";
	// Unknown/missing role: do not send to /calendar (requireRole would bounce to login again).
	return ATTENDEE_LOGIN_PATH;
}
