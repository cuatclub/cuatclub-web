"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { signOut } from "@/lib/auth-client";
import { CLUB_DASHBOARD_NAV_ITEMS, isClubDashboardNavActive } from "@/components/Navbar";
import { ConfirmModal } from "@/components";
import { cn } from "@/lib/utils";

const itemClass =
  "font-ibm-plex flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors md:text-base";

type DashboardSidebarProps = {
  name: string;
  email: string;
  image: string | null;
};

// Desktop only — below `md` this menu lives in the shared Navbar's mobile drawer instead (see
// Navbar.tsx), so there's a single hamburger/drawer on small screens, not two.
export function DashboardSidebar({ name, email, image }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const avatarSrc = image ?? "/svg/user_profile.svg";
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    // No explicit height here: DashboardShell's default `align-items: stretch` (it's the flex
    // row) already matches this to `main`'s height. Giving this its own `h-full` would instead
    // *opt it out* of that stretch (a flex item's own specified cross-size always wins), and
    // percentage heights don't resolve reliably through a flex-grown ancestor anyway — see
    // DashboardShell's comment.
    <aside className="border-border hidden bg-white py-6 md:flex md:w-64 md:shrink-0 md:flex-col md:justify-between md:border-r md:px-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Image
            src={avatarSrc}
            alt="Profile"
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="font-ibm-plex text-foreground truncate text-sm font-semibold">
              {name}
            </span>
            <span className="font-ibm-plex text-foreground-muted truncate text-xs">{email}</span>
          </div>
        </div>
        <div className="border-border border-t" />

        <nav className="flex flex-col gap-1" aria-label="เมนูแดชบอร์ด">
          {CLUB_DASHBOARD_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = isClubDashboardNavActive(pathname, href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  itemClass,
                  isActive
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-primary-lighter hover:text-primary"
                )}
              >
                <Icon aria-hidden="true" className="size-5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-6">
        <div className="border-border border-t" />
        <button
          type="button"
          onClick={() => setIsLogoutConfirmOpen(true)}
          className={cn(
            itemClass,
            "text-foreground-muted hover:bg-tag-red-light hover:text-tag-red w-full cursor-pointer"
          )}
        >
          <LogOut aria-hidden="true" className="size-5 shrink-0" />
          ออกจากระบบ
        </button>
      </div>

      <ConfirmModal
        open={isLogoutConfirmOpen}
        onOpenChange={setIsLogoutConfirmOpen}
        title="ออกจากระบบ"
        description="คุณต้องการออกจากระบบใช่หรือไม่"
        confirmLabel="ยืนยัน"
        cancelLabel="ยกเลิก"
        isLoading={isLoggingOut}
        onConfirm={() => void handleLogout()}
      />
    </aside>
  );
}
