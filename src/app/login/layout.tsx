import { registrationGuard } from "@/server/registration-guard";

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  await registrationGuard(undefined, { onUnauthenticated: "allow" });
  return children;
}
