import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/server/auth";
import {
	ATTENDEE_LOGIN_PATH,
	defaultHomePathForRole,
	pendingOnboardingPath,
} from "@/lib/auth-paths";

export default async function Home() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) {
		redirect(ATTENDEE_LOGIN_PATH);
	}
	const user = session.user as {
		role?: string;
		onboardingComplete?: boolean;
	};
	const pending = pendingOnboardingPath(user);
	redirect(pending ?? defaultHomePathForRole(user.role));
}
