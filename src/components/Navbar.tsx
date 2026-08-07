import { Menu, User } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/Button";

const NAV_LINKS = ["ชมรม", "กิจกรรม", "เกี่ยวกับ"];

type NavbarProps = {
  isLoggedIn?: boolean;
};

export function Navbar({ isLoggedIn = false }: NavbarProps) {
  return (
    <nav className="flex items-center justify-between bg-white px-4 py-3 md:px-16">
      <Image src="/images/logo.svg" alt="CUatClub" width={76} height={40} priority />

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

      <div className="hidden items-center gap-3 md:flex">
        {isLoggedIn ? (
          <>
            <Button variant="outline">แดชบอร์ด</Button>
            <div className="bg-primary-light flex h-10 w-10 items-center justify-center rounded-full">
              <User className="text-primary h-5 w-5" />
            </div>
          </>
        ) : (
          <>
            <Button variant="outline">เข้าสู่ระบบ</Button>
            <Button variant="primary">ลงทะเบียน</Button>
          </>
        )}
      </div>

      <Menu className="text-foreground h-5 w-5 md:hidden" />
    </nav>
  );
}
