import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/server/auth";
import { ATTENDEE_LOGIN_PATH, defaultHomePathForRole } from "@/lib/auth-paths";

export type AppRole = "ATTENDEE" | "ORGANIZATION" | "ADMIN";

/**
 * Role-only guard for route-group layouts. Onboarding is enforced in middleware.
 */
export async function requireRole(required: AppRole) {
	const session = await auth.api.getSession({ headers: await headers() });
	const role = session?.user?.role;
	if (!session?.user || !role) {
		redirect(ATTENDEE_LOGIN_PATH);
	}
	if (role === required) {
		return session;
	}
	redirect(defaultHomePathForRole(role));
}
