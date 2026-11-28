"use client";

import { usePathname } from "next/navigation";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";

import { RESET_PASSWORD_PATH } from "@/app/(site)/reset-password/reset-password-schema";

export function SiteAnalytics({ gaId }: { gaId: string | undefined }) {
  // That page's URL carries a password-reset token, which must not reach third parties.
  if (usePathname() === RESET_PASSWORD_PATH) return null;

  return (
    <>
      <Analytics />
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </>
  );
}
