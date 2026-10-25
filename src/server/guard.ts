import "server-only";
import { headers } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { api } from "@/trpc/server";
import { auth } from "@/server/auth";
import type { GetClubProfileOutputDTO } from "@/server/api/modules/clubs/dto";
import type { GetStudentRegistrationOutputDTO } from "@/server/api/modules/students/dto";
import { STUDENT_REGISTRATION_STEPS } from "@/server/api/modules/students/entities/student.entity";

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

const STUDENT_STEP_PATH: Record<GetStudentRegistrationOutputDTO["registrationStatus"], string> = {
  PENDING: "/register/student/general",
  GENERAL_SUBMITTED: "/register/student/preference",
  PREFERENCES_SUBMITTED: "/register/student/source",
  COMPLETED: "/register/student/line",
};

/**
 * Guards /register/student/**: sends a STUDENT user back to the furthest
 * step they've actually reached if they open a later one. Anonymous visitors go to
 * /login; authenticated non-STUDENT users have nothing to register, so
 * they go home.
 */
export async function studentRegistrationStepGuard(
  currentStep: GetStudentRegistrationOutputDTO["registrationStatus"]
): Promise<GetStudentRegistrationOutputDTO> {
  let student: GetStudentRegistrationOutputDTO;
  try {
    student = await api.students.getRegistration({});
  } catch (err) {
    if (err instanceof TRPCError && err.code === "UNAUTHORIZED") redirect("/login");
    if (err instanceof TRPCError && err.code === "NOT_FOUND") redirect("/");
    throw err;
  }

  // Only steps the student hasn't reached yet are off limits — earlier ones stay open for the
  // back link.
  const stepIndex = (step: typeof currentStep) => STUDENT_REGISTRATION_STEPS.indexOf(step);
  if (stepIndex(student.registrationStatus) < stepIndex(currentStep)) {
    redirect(STUDENT_STEP_PATH[student.registrationStatus]);
  }

  return student;
}

/**
 * Entry point for /register/student: sends a student to the first step they haven't finished,
 * or home if they already have. Login and Google sign-in both land here because neither knows
 * how far the student got.
 */
export async function studentRegistrationResumeGuard(): Promise<never> {
  try {
    const student = await api.students.getRegistration({});
    redirect(
      student.registrationStatus === "COMPLETED"
        ? "/"
        : STUDENT_STEP_PATH[student.registrationStatus]
    );
  } catch (err) {
    if (err instanceof TRPCError && err.code === "UNAUTHORIZED") redirect("/login");
    if (err instanceof TRPCError && err.code === "NOT_FOUND") redirect("/");
    throw err;
  }
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

/**
 * Per-request memo: the dashboard layout and page both need the session; cache() makes
 * it one lookup.
 */
export const getSessionOnce = cache(async () => auth.api.getSession({ headers: await headers() }));

export interface ClubDashboardSessionUser {
  name: string;
  email: string;
  image: string | null;
}

/**
 * Guards /dashboard/**: anonymous visitors go to /login, and a signed-in
 * non-CLUB user (STUDENT or ADMIN) goes home — mirrors adminGuard's own
 * upfront role check rather than relying solely on the club-row lookup
 * below to reject them. A club still mid-registration is sent to whichever
 * step page matches its registrationStatus — mirrors clubRegistrationStepGuard
 * so the dashboard never renders for a club that hasn't finished onboarding
 * yet.
 *
 * Returns the signed-in user so the dashboard shell's sidebar can show the
 * club's name/email/avatar without a second session lookup.
 */
export async function clubDashboardGuard(): Promise<ClubDashboardSessionUser> {
  const session = await getSessionOnce();
  if (!session) redirect("/login");
  if (session.user.role !== "CLUB") redirect("/");

  let club: GetClubProfileOutputDTO;
  try {
    club = await api.clubs.getClubProfile({});
  } catch (err) {
    if (err instanceof TRPCError && err.code === "UNAUTHORIZED") redirect("/login");
    if (err instanceof TRPCError && err.code === "NOT_FOUND") redirect("/");
    throw err;
  }

  if (club.registrationStatus !== "COMPLETED") {
    redirect(STEP_PATH[club.registrationStatus]);
  }

  return { name: session.user.name, email: session.user.email, image: session.user.image ?? null };
}
