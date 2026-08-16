"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const CLUB_LIST_PATH = "/clubs";

/**
 * Returns the visitor to wherever they came from. Falls back to the club list when
 * there is no history to go back to — a direct link, a fresh tab, or a shared URL.
 */
export function BackLink() {
  const router = useRouter();

  const handleClick = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push(CLUB_LIST_PATH);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="font-ibm-plex text-placeholder hover:text-foreground-secondary focus-visible:ring-primary flex w-fit cursor-pointer items-center gap-2 rounded-sm text-sm leading-[23px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:text-base md:leading-[26px]"
    >
      <ArrowLeft aria-hidden="true" className="size-4 shrink-0 md:size-5" />
      ย้อนกลับ
    </button>
  );
}
