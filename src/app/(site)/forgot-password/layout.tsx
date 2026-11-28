import { loginGuard } from "@/server/guard";

export default async function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  await loginGuard();
  return children;
}
