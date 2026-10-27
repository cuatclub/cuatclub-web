import { studentRegistrationStepGuard } from "@/server/guard";

// Connecting LINE is owned by another team — this page only exists so the end of the
// registration flow has somewhere to land. Replace its body, keep the guard.
export default async function RegisterStudentLinePage() {
  await studentRegistrationStepGuard("COMPLETED");

  return (
    <main className="flex justify-center px-4 pt-5 pb-8 md:pt-20 md:pb-16">
      <h1 className="font-ibm-plex text-primary text-2xl font-bold md:text-3xl">เชื่อมต่อ LINE</h1>
    </main>
  );
}
