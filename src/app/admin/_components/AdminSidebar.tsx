"use client";

import { useEffect, useRef, type RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard, disabled: true },
  { href: "/admin/clubs", label: "ชมรม", icon: Users, disabled: false },
] as const;

const itemClass =
  "font-ibm-plex flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors md:text-base";

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

type AdminSidebarProps = {
  /** Drawer visibility below `md` — the desktop sidebar below always renders on its own. */
  mobileOpen: boolean;
  onMobileClose: () => void;
  /** The header's hamburger button — focus returns here when the drawer closes. */
  menuButtonRef: RefObject<HTMLButtonElement | null>;
};

export function AdminSidebar({ mobileOpen, onMobileClose, menuButtonRef }: AdminSidebarProps) {
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Mirrors Navbar.tsx's mobile drawer: move focus in on open, trap Tab within it, close on
  // Escape, and hand focus back to the opener button on close.
  useEffect(() => {
    if (!mobileOpen) return;

    const drawer = drawerRef.current;
    const firstFocusable = drawer?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    firstFocusable?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onMobileClose();
        return;
      }

      if (event.key !== "Tab" || !drawer) return;

      const focusable = Array.from(drawer.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
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
    const menuButton = menuButtonRef.current;
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      menuButton?.focus();
    };
  }, [mobileOpen, onMobileClose, menuButtonRef]);

  const renderNavItems = (onNavigate?: () => void) =>
    NAV_ITEMS.map(({ href, label, icon: Icon, disabled }) => {
      const isActive = pathname === href || pathname.startsWith(`${href}/`);

      if (disabled) {
        return (
          <span
            key={href}
            aria-disabled="true"
            className={cn(itemClass, "text-placeholder cursor-not-allowed")}
          >
            <Icon aria-hidden="true" className="size-5 shrink-0" />
            {label}
            <span className="bg-border text-foreground-muted ml-auto rounded-full px-2 py-0.5 text-xs font-normal">
              เร็วๆ นี้
            </span>
          </span>
        );
      }

      return (
        <Link
          key={href}
          href={href}
          aria-current={isActive ? "page" : undefined}
          onClick={onNavigate}
          className={cn(
            itemClass,
            isActive ? "bg-primary text-white" : "text-foreground hover:bg-primary-lighter"
          )}
        >
          <Icon aria-hidden="true" className="size-5 shrink-0" />
          {label}
        </Link>
      );
    });

  return (
    <>
      {/* Desktop: always-visible full sidebar. */}
      <aside className="border-border hidden bg-white md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-r">
        <div className="flex items-center gap-2 px-5 py-4 md:px-6 md:py-3">
          <Link href="/admin/clubs" className="flex items-center gap-2">
            <Image
              src="/svg/logo.svg"
              alt="CUatClub"
              width={100}
              height={100}
              priority
              className="h-11 w-auto"
            />
          </Link>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-3" aria-label="เมนูแอดมิน">
          {renderNavItems()}
        </nav>
      </aside>

      {/* Mobile: hidden until opened, then a drawer covering part of the screen over content. */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            aria-hidden="true"
            onClick={onMobileClose}
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="เมนูแอดมิน"
            className="animate-in slide-in-from-left relative z-10 flex h-full w-[72%] max-w-xs flex-col bg-white shadow-xl duration-200"
          >
            <div className="border-border flex h-16 items-center justify-between border-b px-4">
              <Link href="/admin/clubs" onClick={onMobileClose} className="flex items-center gap-2">
                <Image
                  src="/svg/logo.svg"
                  alt="CUatClub"
                  width={76}
                  height={40}
                  className="h-7 w-[53px]"
                />
              </Link>
              <button
                type="button"
                aria-label="ปิดเมนู"
                onClick={onMobileClose}
                className="text-foreground-muted hover:bg-primary-lighter flex size-8 items-center justify-center rounded-lg"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1 px-3 py-3" aria-label="เมนูแอดมิน (มือถือ)">
              {renderNavItems(onMobileClose)}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
