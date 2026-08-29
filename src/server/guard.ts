import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { api } from "@/trpc/server";
import { auth } from "@/server/auth";
import type { GetClubProfileOutputDTO } from "@/server/api/modules/clubs/dto";

type RegistrationStep = "PENDING" | "INFO_SUBMITTED" | "COMPLETED";

const STEP_PATH: Record<RegistrationStep, string> = {
  PENDING: "/register/club/profile",
  INFO_SUBMITTED: "/register/club/review",
  COMPLETED: "/register/club/success",
};

/**
 * Shared by loginGuard and registerGuard: anonymous visitors are the
 * expected case and render the page as normal. Anyone already authenticated
 * — any role, any registrationStatus — has no business signing in or
 * creating another account, so they're sent home instead of back into their
 * registration flow.
 */
async function guestOnlyGuard(): Promise<void> {
  try {
    await api.clubs.getClubProfile({});
  } catch (err) {
    if (err instanceof TRPCError && err.code === "UNAUTHORIZED") return;
    if (err instanceof TRPCError && err.code === "NOT_FOUND") redirect("/");
    throw err;
  }
  redirect("/");
}

/**
 * Guards /login — see guestOnlyGuard.
 */
export async function loginGuard(): Promise<void> {
  return guestOnlyGuard();
}

/**
 * Guards /register (the account-creation page only — not /register/club/**,
 * which guards itself per-step via clubRegistrationStepGuard and must stay
 * reachable by an authenticated CLUB user mid-registration) — see
 * guestOnlyGuard.
 */
export async function registerGuard(): Promise<void> {
  return guestOnlyGuard();
}

/**
 * Guards /register/club/**: routes a CLUB user to whichever step page
 * actually matches their registrationStatus. Anonymous visitors go to
 * /login; authenticated non-CLUB users (no club row) have nothing to
 * register, so they go home.
 */
export async function clubRegistrationStepGuard(
  currentStep: RegistrationStep
): Promise<GetClubProfileOutputDTO> {
  let club: GetClubProfileOutputDTO;
  try {
    club = await api.clubs.getClubProfile({});
  } catch (err) {
    if (err instanceof TRPCError && err.code === "UNAUTHORIZED") redirect("/login");
    if (err instanceof TRPCError && err.code === "NOT_FOUND") redirect("/");
    throw err;
  }

  if (club.registrationStatus !== currentStep) {
    redirect(STEP_PATH[club.registrationStatus]);
  }

  return club;
}

export interface AdminSessionUser {
  name: string;
  email: string;
}

/**
 * Guards /admin/**: anonymous visitors go to /login, and anyone signed in
 * without the ADMIN role goes home — mirrors adminProcedure's own check
 * (procedures.ts) so the page never even renders for a non-admin, rather
 * than relying solely on the tRPC calls inside it to reject.
 *
 * Returns the signed-in user so the admin layout's header can show it
 * without a second session lookup.
 */
export async function adminGuard(): Promise<AdminSessionUser> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  return { name: session.user.name, email: session.user.email };
}
