import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Back to the previous registration step. Steps are routes, so a plain link is enough. */
export function BackLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="font-ibm-plex text-placeholder hover:text-foreground-secondary focus-visible:ring-primary flex w-fit cursor-pointer items-center gap-2 rounded-sm text-sm leading-[23px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:text-base md:leading-[26px]"
    >
      <ArrowLeft aria-hidden="true" className="size-4 shrink-0 md:size-5" />
      ย้อนกลับ
    </Link>
  );
}
