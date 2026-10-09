"use client";

import type { CSSProperties } from "react";
import { CircleCheck, Info, Loader2, OctagonX, TriangleAlert } from "lucide-react";
import { Toaster as Sonner, toast, type ToasterProps } from "sonner";

import { useMediaQuery } from "@/hooks/use-media-query";

/**
 * App-wide toast outlet — mount once, in the root layout. Toasts sit top-right on desktop and
 * bottom-center on mobile, where the bottom of the screen is closest to the thumb and clear of the
 * navbar. Fire them with `toast.success(...)` from anywhere on the client.
 */
function Toaster(props: ToasterProps) {
  const isDesktop = useMediaQuery("(min-width: 48rem)");

  return (
    <Sonner
      theme="light"
      position={isDesktop ? "top-right" : "bottom-center"}
      // Clears the sticky 64px Navbar/AdminHeader so a toast never covers the account menu.
      offset={{ top: 80 }}
      className="toaster group"
      icons={{
        success: <CircleCheck className="text-success size-4" />,
        info: <Info className="size-4" />,
        warning: <TriangleAlert className="size-4" />,
        error: <OctagonX className="text-error size-4" />,
        loading: <Loader2 className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: "font-ibm-plex shadow-black text-sm leading-[23px]",
        },
      }}
      style={
        {
          "--normal-bg": "white",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "0.75rem",
        } as CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster, toast };
