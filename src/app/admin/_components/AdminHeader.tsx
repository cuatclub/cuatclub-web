"use client";

import { useState, type RefObject } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";

import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";

type AdminHeaderProps = {
  name: string;
  email: string;
  onMenuClick: () => void;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
};

export function AdminHeader({ name, email, onMenuClick, menuButtonRef }: AdminHeaderProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <header className="border-border sticky top-0 z-10 flex h-14 items-center justify-between gap-2 border-b bg-white px-3 sm:h-16 sm:gap-4 sm:px-5 md:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <button
          ref={menuButtonRef}
          type="button"
          aria-label="เปิดเมนู"
          onClick={onMenuClick}
          className="text-foreground-muted hover:bg-primary-lighter flex size-9 shrink-0 items-center justify-center rounded-lg md:hidden"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>
        <h1 className="font-ibm-plex text-primary truncate text-base font-bold sm:text-lg md:text-xl">
          Admin Dashboard
        </h1>
      </div>

      <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-4">
        <div className="hidden min-w-0 flex-col items-end leading-tight sm:flex">
          <span className="font-ibm-plex text-foreground truncate text-sm font-medium md:text-base">
            {name}
          </span>
          <span className="font-ibm-plex text-foreground-muted truncate text-xs md:text-sm">
            {email}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleLogout}
          isLoading={isSigningOut}
          className="h-9 gap-1.5 px-2.5 text-xs sm:h-10 sm:gap-2 sm:px-6 sm:text-sm md:text-base"
        >
          <LogOut aria-hidden="true" className="size-4 shrink-0" />
          <span className="hidden sm:inline">ออกจากระบบ</span>
        </Button>
      </div>
    </header>
  );
}
