import { StudentSourceForm } from "@/app/(site)/register/student/source/_components/StudentSourceForm";
import { StudentStepCard } from "@/app/(site)/register/student/_components/StudentStepCard";
import { studentRegistrationStepGuard } from "@/server/guard";

export default async function RegisterStudentSourcePage() {
  const registration = await studentRegistrationStepGuard("PREFERENCES_SUBMITTED");

  return (
    <StudentStepCard
      title="คุณรู้จักเราผ่านช่องทางไหน?"
      step={3}
      backHref="/register/student/preference"
    >
      <StudentSourceForm existing={registration} />
    </StudentStepCard>
  );
}
