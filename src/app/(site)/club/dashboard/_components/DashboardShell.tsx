import { DashboardSidebar } from "@/app/(site)/club/dashboard/_components/DashboardSidebar";

type DashboardShellProps = {
  name: string;
  email: string;
  image: string | null;
  children: React.ReactNode;
};

// Below `md`, the dashboard's own nav lives in the shared Navbar's mobile drawer instead of a
// second sidebar here — see Navbar.tsx. On `md`+, DashboardSidebar sticks to the viewport on
// its own (see its comment) — this row only needs to stay wide enough to host it next to `main`.
export function DashboardShell({ name, email, image, children }: DashboardShellProps) {
  return (
    <div className="flex w-full flex-1">
      <DashboardSidebar name={name} email={email} image={image} />
      <main className="flex-1 px-4 py-4 sm:px-5 sm:py-6 md:px-10 md:py-10 md:pb-20">
        {children}
      </main>
    </div>
  );
}
