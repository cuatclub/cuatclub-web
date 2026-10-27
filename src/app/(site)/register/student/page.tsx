import { studentRegistrationResumeGuard } from "@/server/guard";

export default async function RegisterStudentIndexPage() {
  return studentRegistrationResumeGuard();
}
