"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark, LogOut, Menu, Settings, X } from "lucide-react";

import { buttonVariants } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";

type NavLink = { label: string; href: string | null };

const NAV_LINKS: NavLink[] = [
  { label: "ชมรม", href: "/clubs" },
  { label: "กิจกรรม", href: null },
  { label: "เกี่ยวกับ", href: null },
];

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

type NavbarProps = {
  isLoggedIn?: boolean;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  userImage?: string | null;
};

export function Navbar({
  isLoggedIn = false,
  userName,
  userEmail,
  userRole,
  userImage,
}: NavbarProps) {
  const profileImageSrc = userImage ?? "/svg/user_profile.svg";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const isClub = isLoggedIn && userRole === "CLUB";
  const isAdmin = isLoggedIn && userRole === "ADMIN";

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    if (!isSidebarOpen) return;

    const sidebar = sidebarRef.current;
    const firstFocusable = sidebar?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    firstFocusable?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
        return;
      }

      if (event.key !== "Tab" || !sidebar) return;

      const focusable = Array.from(sidebar.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const menuToggle = menuToggleRef.current;
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      menuToggle?.focus();
    };
  }, [isSidebarOpen]);

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <nav className="sticky top-0 z-30 flex items-center justify-between bg-white px-4 py-3 shadow-black md:px-16">
      <div className="md:flex md:items-center">
        <Link href="/" aria-label="CUatClub หน้าแรก">
          <Image
            src="/svg/logo.svg"
            alt="CUatClub"
            width={76}
            height={40}
            priority
            className="h-7 w-[53px] md:h-10 md:w-[76px]"
          />
        </Link>
      </div>

      <div className="hidden items-center gap-6 md:absolute md:left-1/2 md:flex md:-translate-x-1/2">
        {NAV_LINKS.map(({ label, href }) => {
          const isActive = href !== null && pathname === href;

          return href ? (
            <Link
              key={label}
              href={href}
              className={cn(
                "font-ibm-plex after:bg-primary hover:text-primary relative cursor-pointer px-4 py-2 text-base font-medium after:absolute after:right-4 after:-bottom-3 after:left-4 after:h-1 after:rounded-full after:transition-transform after:content-[''] hover:after:scale-x-100",
                isActive ? "text-primary after:scale-x-100" : "text-foreground after:scale-x-0"
              )}
            >
              {label}
            </Link>
          ) : (
            <button
              key={label}
              type="button"
              disabled
              aria-disabled="true"
              className="font-ibm-plex text-placeholder cursor-not-allowed px-4 py-2 text-base font-medium"
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className={`hidden items-center justify-end md:flex ${isLoggedIn ? "gap-6" : "gap-3"}`}>
        {isLoggedIn ? (
          <>
            {isClub && (
              <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
                แดชบอร์ด
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" className={buttonVariants({ variant: "outline" })}>
                แดชบอร์ด
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger
                type="button"
                aria-label="เมนูผู้ใช้"
                className="cursor-pointer rounded-full"
              >
                <Image
                  src={profileImageSrc}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <div className="flex items-center gap-2 pb-2">
                  <Image
                    src={profileImageSrc}
                    alt="Profile"
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full"
                  />
                  <div className="flex flex-col">
                    {userName && (
                      <span className="font-ibm-plex text-foreground text-sm font-semibold">
                        {userName}
                      </span>
                    )}
                    {userEmail && (
                      <span className="font-ibm-plex text-foreground-secondary text-xs">
                        {userEmail}
                      </span>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={handleSignOut}
                  className="text-foreground-secondary bg-text-error hover:text-error focus:text-error data-[highlighted]:text-error data-[highlighted]:bg-tag-red-light"
                >
                  <LogOut className="h-4 w-4" />
                  ออกจากระบบ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Link href="/login" className={buttonVariants({ variant: "outline" })}>
              เข้าสู่ระบบ
            </Link>
            <Link href="/register" className={buttonVariants()}>
              ลงทะเบียน
            </Link>
          </>
        )}
      </div>

      <button
        ref={menuToggleRef}
        type="button"
        aria-label="เปิดเมนู"
        aria-expanded={isSidebarOpen}
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden"
      >
        <Menu className="text-foreground h-5 w-5" />
      </button>

      {isSidebarOpen && (
        <div className="fixed inset-0 flex md:hidden">
          <div
            className="absolute inset-0 z-20 bg-black/30"
            onClick={closeSidebar}
            aria-hidden="true"
          />

          <div
            ref={sidebarRef}
            role="dialog"
            aria-modal="true"
            aria-label="เมนู"
            className="animate-in slide-in-from-right z-50 ml-auto flex h-full w-[300px] flex-col bg-white px-5 duration-300"
          >
            <div className="flex h-16 items-center justify-end">
              <button type="button" aria-label="ปิดเมนู" onClick={closeSidebar}>
                <X className="text-foreground h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {NAV_LINKS.map(({ label, href }) => {
                const isActive = href !== null && pathname === href;

                return href ? (
                  <Link
                    key={label}
                    href={href}
                    onClick={closeSidebar}
                    className={cn(
                      "font-ibm-plex py-1 text-left text-sm font-medium",
                      isActive ? "text-primary" : "text-foreground"
                    )}
                  >
                    {label}
                  </Link>
                ) : (
                  <button
                    key={label}
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="font-ibm-plex text-placeholder cursor-not-allowed py-1 text-left text-sm font-medium"
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="border-border my-6 border-t" />

            {isLoggedIn ? (
              <>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="font-ibm-plex text-placeholder flex cursor-not-allowed items-center gap-2 rounded-lg p-2 text-sm font-medium"
                  >
                    <Bookmark className="h-4 w-4" />
                    ที่บันทึกไว้
                  </button>
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="font-ibm-plex text-placeholder flex cursor-not-allowed items-center gap-2 rounded-lg p-2 text-sm font-medium"
                  >
                    <Settings className="h-4 w-4" />
                    ตั้งค่า
                  </button>
                </div>

                <div className="border-border my-6 border-t" />

                {(userName ?? userEmail) && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Image
                        src={profileImageSrc}
                        alt="Profile"
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-full"
                      />
                      <div className="flex flex-col">
                        {userName && (
                          <span className="font-ibm-plex text-foreground text-xs font-semibold">
                            {userName}
                          </span>
                        )}
                        {userEmail && (
                          <span className="font-ibm-plex text-foreground-secondary text-[10px]">
                            {userEmail}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="font-ibm-plex text-foreground-secondary hover:text-error text-[10px]"
                    >
                      ออกจากระบบ
                    </button>
                  </div>
                )}

                {isClub && (
                  <Link
                    href="/dashboard"
                    onClick={closeSidebar}
                    className={cn(buttonVariants({ variant: "outline" }), "mt-6 w-full")}
                  >
                    แดชบอร์ด
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={closeSidebar}
                    className={cn(buttonVariants({ variant: "outline" }), "mt-6 w-full")}
                  >
                    แดชบอร์ด
                  </Link>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href="/register"
                  onClick={closeSidebar}
                  className={cn(buttonVariants(), "w-full")}
                >
                  ลงทะเบียน
                </Link>
                <Link
                  href="/login"
                  onClick={closeSidebar}
                  className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                >
                  เข้าสู่ระบบ
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
