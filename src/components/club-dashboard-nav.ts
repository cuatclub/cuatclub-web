import { FilePlus2, List, UserRoundCog, type LucideIcon } from "lucide-react";

/**
 * The club dashboard's own nav items — shared by the desktop sidebar
 * (DashboardSidebar) and the shared Navbar's mobile drawer, which merges
 * these in for a signed-in club instead of showing a second hamburger/drawer
 * for the dashboard on small screens.
 */
export const CLUB_DASHBOARD_NAV_ITEMS: ReadonlyArray<{
  href: string;
  label: string;
  icon: LucideIcon;
}> = [
  { href: "/dashboard", label: "โพสต์ของฉัน", icon: List },
  { href: "/dashboard/posts/new", label: "สร้างโพสต์", icon: FilePlus2 },
  { href: "/dashboard/profile", label: "จัดการโปรไฟล์", icon: UserRoundCog },
];

/**
 * "/dashboard" is a prefix of every other item's href, so it needs an exact
 * match — startsWith alone would keep "My Posts" highlighted on every other
 * tab too.
 */
export function isClubDashboardNavActive(pathname: string, href: string): boolean {
  return href === "/dashboard"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}
