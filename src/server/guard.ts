import "server-only";
import { redirect } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { api } from "@/trpc/server";
import type { GetClubProfileOutputDTO } from "@/server/api/modules/clubs/dto";

type RegistrationStep = "PENDING" | "INFO_SUBMITTED" | "COMPLETED";

const STEP_PATH: Record<RegistrationStep, string> = {
  PENDING: "/register/club/profile",
  INFO_SUBMITTED: "/register/club/review",
  COMPLETED: "/register/club/success",
};

/**
 * Guards /login: anonymous visitors are the expected case and render the
 * page as normal. Anyone already authenticated — any role, any
 * registrationStatus — has no business on the login page, so they're sent
 * home instead of back into their registration flow.
 */
export async function loginGuard(): Promise<void> {
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
