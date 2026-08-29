import { clubRegistrationStepGuard } from "@/server/guard";

export default async function RegisterReviewPage() {
  await clubRegistrationStepGuard("INFO_SUBMITTED");

  return <div>TODO: review submitted club info — issue #83</div>;
}
