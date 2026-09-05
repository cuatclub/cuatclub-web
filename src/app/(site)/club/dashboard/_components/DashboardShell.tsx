import { DashboardSidebar } from "@/app/(site)/club/dashboard/_components/DashboardSidebar";

type DashboardShellProps = {
  name: string;
  email: string;
  image: string | null;
  children: React.ReactNode;
};

// Below `md`, the dashboard's own nav lives in the shared Navbar's mobile drawer instead of a
// second sidebar here — see Navbar.tsx and DashboardSidebar's own comment.
export function DashboardShell({ name, email, image, children }: DashboardShellProps) {
  return (
    <div className="flex w-full flex-1">
      <DashboardSidebar name={name} email={email} image={image} />
      <main className="flex-1 px-4 py-4 sm:px-5 sm:py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
