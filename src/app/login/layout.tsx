import { loginGuard } from "@/server/guard";

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  await loginGuard();
  return children;
}
