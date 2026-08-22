import { registrationGuard } from "@/server/registration-guard";

export default async function RegisterClubInfoPage() {
  await registrationGuard("PENDING");

  return <div>TODO: club info form — issue #83</div>;
}
