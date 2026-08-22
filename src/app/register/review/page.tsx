import { registrationGuard } from "@/server/registration-guard";

export default async function RegisterReviewPage() {
  await registrationGuard("INFO_SUBMITTED");

  return <div>TODO: review submitted club info — issue #83</div>;
}
