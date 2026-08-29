import { adminGuard } from "@/server/guard";
import { AdminShell } from "@/app/admin/_components/AdminShell";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await adminGuard();

  return (
    <AdminShell name={user.name} email={user.email}>
      {children}
    </AdminShell>
  );
}
