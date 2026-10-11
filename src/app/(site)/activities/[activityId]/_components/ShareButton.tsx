"use client";

import { useEffect, useState } from "react";
import { Check, Share2 } from "lucide-react";

import { Button } from "@/components/ui/Button";

const COPIED_FEEDBACK_MS = 2000;

type ShareButtonProps = {
  title: string;
};

/**
 * Opens the device's share sheet where there is one (phones, Safari). Elsewhere it copies the
 * page link and confirms in place for a moment — the app has no toast to announce it with.
 */
export function ShareButton({ title }: ShareButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const timeout = window.setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_MS);
    return () => window.clearTimeout(timeout);
  }, [isCopied]);

  const handleClick = async () => {
    const url = window.location.href;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        // Dismissing the sheet rejects with AbortError — the visitor's choice, not a failure.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    await navigator.clipboard.writeText(url);
    setIsCopied(true);
  };

  const Icon = isCopied ? Check : Share2;

  return (
    <Button type="button" variant="outline" onClick={handleClick} className="h-9 w-full md:h-10">
      <Icon aria-hidden="true" className="size-4 shrink-0 md:size-5" />
      <span aria-live="polite">{isCopied ? "คัดลอกลิงก์แล้ว" : "แชร์"}</span>
    </Button>
  );
}
