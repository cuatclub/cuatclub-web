import "server-only";
import { redirect } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { api } from "@/trpc/server";
import type { GetClubProfileOutputDTO } from "@/server/api/modules/clubs/dto";

type RegistrationStep = "PENDING" | "INFO_SUBMITTED";

const STEP_PATH: Record<RegistrationStep, string> = {
  PENDING: "/register",
  INFO_SUBMITTED: "/register/review",
};

type RegistrationGuardOptions = {
  /**
   * What to do when nobody is logged in. "redirect" (default) sends them to
   * /login — used by every /register/* page, which require a session.
   * "allow" lets the page render as normal — used by /login itself, where an
   * anonymous visitor is the expected case, not something to redirect away.
   */
  onUnauthenticated?: "redirect" | "allow";
};

export async function registrationGuard(
  currentStep?: RegistrationStep,
  { onUnauthenticated = "redirect" }: RegistrationGuardOptions = {}
): Promise<GetClubProfileOutputDTO | null> {
  let club: GetClubProfileOutputDTO;
  try {
    club = await api.clubs.getClubProfile({});
  } catch (err) {
    if (err instanceof TRPCError && err.code === "UNAUTHORIZED") {
      if (onUnauthenticated === "redirect") redirect("/login");
      return null;
    }
    if (err instanceof TRPCError && err.code === "NOT_FOUND") {
      return null; // logged in, but no club row (e.g. STUDENT/ADMIN) — nothing to gate
    }
    throw err;
  }

  if (club.registrationStatus === "COMPLETED") return club;
  if (club.registrationStatus === currentStep) return club;

  redirect(STEP_PATH[club.registrationStatus as RegistrationStep]);
}
