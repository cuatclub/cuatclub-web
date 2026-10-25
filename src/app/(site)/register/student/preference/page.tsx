import { StudentPreferenceForm } from "@/app/(site)/register/student/preference/_components/StudentPreferenceForm";
import { StudentStepCard } from "@/app/(site)/register/student/_components/StudentStepCard";
import { studentRegistrationStepGuard } from "@/server/guard";
import { api } from "@/trpc/server";

export default async function RegisterStudentPreferencePage() {
  await studentRegistrationStepGuard("GENERAL_SUBMITTED");
  const [categories, activityTypes] = await Promise.all([
    api.masterData.categories.getAll({}),
    api.masterData.activityTypes.getAll({}),
  ]);

  return (
    <StudentStepCard title="เลือกความสนใจ" step={2} backHref="/register/student/general">
      <StudentPreferenceForm categories={categories} activityTypes={activityTypes} />
    </StudentStepCard>
  );
}
