"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { signOut } from "@/lib/auth-client";
import {
  CLUB_DASHBOARD_NAV_ITEMS,
  isClubDashboardNavActive,
} from "@/components/club-dashboard-nav";
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

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="border-border hidden bg-white md:flex md:w-64 md:shrink-0 md:flex-col md:border-r">
      <div className="flex items-center gap-3 px-5 py-4 md:px-6">
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
      <div className="border-border mx-5 border-t md:mx-6" />

      <nav className="flex flex-1 flex-col gap-1 px-3 py-3" aria-label="เมนูแดชบอร์ด">
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

      <div className="border-border mx-5 border-t md:mx-6" />
      <div className="px-3 py-3">
        <button
          type="button"
          onClick={() => void handleLogout()}
          className={cn(
            itemClass,
            "text-foreground-muted hover:bg-primary-lighter hover:text-primary w-full"
          )}
        >
          <LogOut aria-hidden="true" className="size-5 shrink-0" />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}
