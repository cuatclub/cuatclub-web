import type { ComponentType, SVGProps } from "react";
import { Instagram } from "lucide-react";
import Image from "next/image";

import { GithubIcon, TiktokIcon } from "@/components/icons";

type SocialLink = {
  label: string;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

// href is intentionally left blank — fill in the real profile URLs here.
const SOCIAL_LINKS: SocialLink[] = [
  { label: "Instagram", href: "https://www.instagram.com/cuatclub.chula/", Icon: Instagram },
  // { label: "TikTok", href: "", Icon: TiktokIcon },
  { label: "GitHub", href: "https://github.com/cuatclub/cuatclub-web", Icon: GithubIcon },
];

export function Footer() {
  return (
    <footer className="bg-primary mt-8 flex flex-col gap-8 px-5 py-16 md:mt-16 md:gap-12 md:p-16">
      {/* Below md the whole block stacks and centers; from md the brand sits
          left and the social row is pushed to the right edge. */}
      <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
        <div className="flex flex-col items-center gap-5 md:items-start md:gap-4">
          {/* White variant of the mark — the shared logo.svg is the pink/grey
              one the Navbar needs on a white background. */}
          <Image
            src="/svg/logo-white.svg"
            alt="CUatClub"
            width={96}
            height={48}
            className="h-12 w-24"
          />

          <p className="font-ibm-plex text-center text-sm leading-[1.35] font-semibold text-white md:text-left md:text-base">
            <span className="block">รวมทุก ชมรม กิจกรรม และโอกาส</span>
            <span className="block">ภายในจุฬาฯไว้ในที่เดียว</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {SOCIAL_LINKS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`CUatClub บน ${label}`}
              className="focus-visible:ring-offset-primary hover:bg-primary-lighter flex h-10 w-10 items-center justify-center rounded-full bg-white transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <Icon className="text-primary h-4 w-4" />
            </a>
          ))}
        </div>
      </div>

      <div className="border-t border-white/20" />

      <p className="font-ibm-plex text-center text-sm leading-[1.35] text-white">
        © 2026 Thinc. All rights reserved.
      </p>
    </footer>
  );
}
