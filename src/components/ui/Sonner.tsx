"use client";

import type { CSSProperties } from "react";
import { CircleCheck, Info, Loader2, OctagonX, TriangleAlert } from "lucide-react";
import { Toaster as Sonner, toast, type ToasterProps } from "sonner";

import { useMediaQuery } from "@/hooks/use-media-query";

/**
 * App-wide toast outlet — mount once, in the root layout. Toasts sit bottom-right on desktop and
 * bottom-center on mobile, where the bottom of the screen is closest to the thumb. They are
 * separated from the page by `shadow-black` alone, with no border. Fire them with
 * `toast.success(...)` from anywhere on the client.
 */
function Toaster(props: ToasterProps) {
  const isDesktop = useMediaQuery("(min-width: 48rem)");

  return (
    <Sonner
      theme="light"
      position={isDesktop ? "top-right" : "bottom-center"}
      offset={{ top: 80 }}
      className="toaster group"
      icons={{
        success: <CircleCheck className="text-success size-5" />,
        info: <Info className="text-primary size-5" />,
        warning: <TriangleAlert className="text-foreground size-5" />,
        error: <OctagonX className="text-error size-5" />,
        loading: <Loader2 className="text-foreground-muted size-5 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          // `!` beats sonner's own border and shadow, which share this selector's specificity.
          toast:
            "font-ibm-plex !border-0 !shadow-black gap-3 !rounded-xl !p-4 !text-base !leading-[23px] font-medium",
          icon: "!size-5 !m-0",
          title: "font-semibold",
          description: "text-foreground-muted font-normal",
        },
      }}
      style={
        {
          "--normal-bg": "white",
          "--normal-text": "var(--foreground)",
          "--normal-border": "transparent",
          "--border-radius": "0.75rem",
        } as CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster, toast };
