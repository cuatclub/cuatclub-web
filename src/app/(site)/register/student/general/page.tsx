import { StudentGeneralForm } from "@/app/(site)/register/student/general/_components/StudentGeneralForm";
import { StudentStepCard } from "@/app/(site)/register/student/_components/StudentStepCard";
import { studentRegistrationStepGuard } from "@/server/guard";
import { api } from "@/trpc/server";

export default async function RegisterStudentGeneralPage() {
  const registration = await studentRegistrationStepGuard("PENDING");
  const faculties = await api.masterData.faculties.getAll({});

  return (
    <StudentStepCard title="สร้างโปรไฟล์" step={1}>
      <StudentGeneralForm faculties={faculties} existing={registration} />
    </StudentStepCard>
  );
}
