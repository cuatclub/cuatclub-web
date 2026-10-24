"use client";

import { useState } from "react";
import Link from "next/link";

import { LINE_CONNECT_FAILED_MESSAGE } from "@/app/(site)/register/student/line/_lib/line-connect-error";
import { Button, buttonVariants } from "@/components/ui/Button";
import { oauth2 } from "@/lib/auth-client";
import { LINE_CONNECT_PATH, LINE_PROVIDER_ID } from "@/lib/line";
import { cn } from "@/lib/utils";

// LINE's brand green isn't a project token, so it's spelled out here once for both
// LINE buttons. Button swaps in `disabled:bg-primary` while `isLoading`; the
// `disabled:` override keeps the connect button green while LINE's page loads.
const LINE_BUTTON_CLASS =
  "h-11 w-full rounded-[10px] bg-[#06c755] hover:bg-[#06c755]/90 disabled:bg-[#06c755]";

type ConnectLineActionsProps = {
  isConnected: boolean;
  addFriendUrl: string;
  nextHref: string;
  /** Copy for the `?error=` LINE redirected back with; cleared on the next attempt. */
  initialErrorMessage: string | null;
};

export function ConnectLineActions({
  isConnected,
  addFriendUrl,
  nextHref,
  initialErrorMessage,
}: ConnectLineActionsProps) {
  const [errorMessage, setErrorMessage] = useState(initialErrorMessage);
  const [isLinking, setIsLinking] = useState(false);

  // Linking a LINE account doesn't make the student a friend of the OA — they can
  // decline (or later block) it on LINE's consent screen, and LINE then delivers
  // nothing. So the add-friend link stays on the connected state unconditionally.
  if (isConnected) {
    return (
      <div className="flex flex-col gap-3">
        <a
          href={addFriendUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants(), LINE_BUTTON_CLASS)}
        >
          เพิ่มเพื่อนใน LINE
        </a>
        <Link href={nextHref} className={cn(buttonVariants(), "h-11 w-full rounded-[10px]")}>
          ไปต่อ
        </Link>
      </div>
    );
  }

  const handleConnect = async () => {
    setErrorMessage(null);
    setIsLinking(true);
    // On success better-auth's client navigates to LINE itself, so `isLinking` is
    // left on until the page unloads. Errors raised on LINE's side (e.g. Cancel)
    // come back as a full redirect to this page's `?error=` instead of here — this
    // only catches the request itself failing, such as an expired session.
    const { error } = await oauth2.link({
      providerId: LINE_PROVIDER_ID,
      callbackURL: LINE_CONNECT_PATH,
      errorCallbackURL: LINE_CONNECT_PATH,
    });
    if (error) {
      setErrorMessage(LINE_CONNECT_FAILED_MESSAGE);
      setIsLinking(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {errorMessage && (
        <p role="alert" className="text-error text-center text-sm leading-[23px]">
          {errorMessage}
        </p>
      )}
      <Button
        type="button"
        className={LINE_BUTTON_CLASS}
        isLoading={isLinking}
        onClick={handleConnect}
      >
        เชื่อมต่อ LINE
      </Button>
      <Link
        href={nextHref}
        className="text-placeholder self-center text-sm leading-[23px] font-medium md:text-base md:leading-[26px]"
      >
        ข้ามไปก่อน
      </Link>
    </div>
  );
}
