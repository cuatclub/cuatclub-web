import { clubDashboardGuard } from "@/server/guard";
import { DashboardShell } from "@/app/(site)/club/dashboard/_components/DashboardShell";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await clubDashboardGuard();

  return (
    <DashboardShell name={user.name} email={user.email} image={user.image}>
      {children}
    </DashboardShell>
  );
}
