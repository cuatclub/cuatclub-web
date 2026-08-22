import { clubRegistrationStepGuard } from "@/server/guard";

export default async function RegisterClubInfoPage() {
  await clubRegistrationStepGuard("PENDING");

  return <div>TODO: club info form — issue #83</div>;
}
