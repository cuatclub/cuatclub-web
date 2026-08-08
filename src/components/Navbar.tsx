"use client";

import { useState } from "react";
import { Bookmark, Menu, Settings, X } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/Button";

const NAV_LINKS = ["ชมรม", "กิจกรรม", "เกี่ยวกับ"];

type NavbarProps = {
  isLoggedIn?: boolean;
};

export function Navbar({ isLoggedIn = false }: NavbarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between bg-white px-4 py-3 md:grid md:grid-cols-[1fr_auto_1fr] md:px-16">
      <div className="md:flex md:min-w-0 md:items-center">
        <Image
          src="/images/logo.svg"
          alt="CUatClub"
          width={76}
          height={40}
          priority
          className="h-7 w-[53px] md:h-10 md:w-[76px]"
        />
      </div>

      <div className="hidden items-center gap-6 md:flex">
        {NAV_LINKS.map((label) => (
          <button
            key={label}
            type="button"
            className="font-ibm-plex text-foreground hover:text-primary cursor-pointer px-4 py-2 text-base font-medium"
          >
            {label}
          </button>
        ))}
      </div>

      <div
        className={`hidden items-center justify-end md:flex md:min-w-0 ${isLoggedIn ? "gap-6" : "gap-3"}`}
      >
        {isLoggedIn ? (
          <>
            <Button variant="outline">แดชบอร์ด</Button>
            <Image
              src="/images/user_profile.svg"
              alt="Profile"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full"
            />
          </>
        ) : (
          <>
            <Button variant="outline">เข้าสู่ระบบ</Button>
            <Button variant="primary">ลงทะเบียน</Button>
          </>
        )}
      </div>

      <button
        type="button"
        aria-label="เปิดเมนู"
        aria-expanded={isSidebarOpen}
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden"
      >
        <Menu className="text-foreground h-5 w-5" />
      </button>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />

          <div className="relative flex h-full w-[300px] flex-col bg-white px-5">
            <div className="flex h-16 items-center justify-end">
              <button type="button" aria-label="ปิดเมนู" onClick={() => setIsSidebarOpen(false)}>
                <X className="text-foreground h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {NAV_LINKS.map((label) => (
                <button
                  key={label}
                  type="button"
                  className="font-ibm-plex text-foreground py-1 text-left text-sm font-medium"
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="border-border my-6 border-t" />

            {isLoggedIn ? (
              <>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    className="font-ibm-plex text-foreground flex items-center gap-2 rounded-lg p-2 text-sm font-medium"
                  >
                    <Bookmark className="h-4 w-4" />
                    ที่บันทึกไว้
                  </button>
                  <button
                    type="button"
                    className="font-ibm-plex text-foreground flex items-center gap-2 rounded-lg p-2 text-sm font-medium"
                  >
                    <Settings className="h-4 w-4" />
                    ตั้งค่า
                  </button>
                </div>

                <div className="border-border my-6 border-t" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/images/user_profile.svg"
                      alt="Profile"
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-full"
                    />
                    <div className="flex flex-col">
                      <span className="font-ibm-plex text-foreground text-xs font-semibold">
                        John Doe
                      </span>
                      <span className="font-ibm-plex text-foreground-secondary text-[10px]">
                        example@gmail.com
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="font-ibm-plex text-foreground-secondary text-[10px]"
                  >
                    Sign out
                  </button>
                </div>

                <Button variant="outline" className="mt-6 w-full">
                  แดชบอร์ด
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <Button variant="primary" className="w-full">
                  ลงทะเบียน
                </Button>
                <Button variant="outline" className="w-full">
                  เข้าสู่ระบบ
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
