import { registerGuard } from "@/server/guard";
import { RegisterForm } from "@/app/(site)/register/_components/RegisterForm";

export default async function Register() {
  await registerGuard();

  return <RegisterForm />;
}
