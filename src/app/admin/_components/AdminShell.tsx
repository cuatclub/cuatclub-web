"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { AdminHeader } from "@/app/admin/_components/AdminHeader";
import { AdminSidebar } from "@/app/admin/_components/AdminSidebar";

type AdminShellProps = {
  name: string;
  email: string;
  children: React.ReactNode;
};

export function AdminShell({ name, email, children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Shared with AdminSidebar so the drawer can restore focus to the control that opened it.
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // A nav tap should close the drawer instead of leaving it open behind the new page.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        menuButtonRef={menuButtonRef}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          name={name}
          email={email}
          onMenuClick={() => setMobileOpen(true)}
          menuButtonRef={menuButtonRef}
        />
        <main className="flex-1 px-4 py-4 sm:px-5 sm:py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
