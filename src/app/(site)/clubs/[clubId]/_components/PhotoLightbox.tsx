"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const CONTROL_CLASS =
  "flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none";

type PhotoLightboxProps = {
  photos: string[];
  index: number;
  clubName: string;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
};

/**
 * Enlarged photo view. There is no Figma frame for this, so it stays deliberately plain:
 * the photo carries the screen and every control is a quiet white-on-dark affordance.
 */
export function PhotoLightbox({
  photos,
  index,
  clubName,
  onClose,
  onNavigate,
}: PhotoLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const photo = photos[index];
  const hasMultiple = photos.length > 1;

  // Refs keep the keydown listener stable so it isn't torn down on every photo change.
  const stateRef = useRef({ index, photoCount: photos.length, onClose, onNavigate });
  useEffect(() => {
    stateRef.current = { index, photoCount: photos.length, onClose, onNavigate };
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      const { index: current, photoCount, onClose: close, onNavigate: navigate } = stateRef.current;

      if (event.key === "Escape") {
        close();
        return;
      }

      if (event.key === "ArrowLeft" && photoCount > 1) {
        navigate((current - 1 + photoCount) % photoCount);
        return;
      }

      if (event.key === "ArrowRight" && photoCount > 1) {
        navigate((current + 1) % photoCount);
        return;
      }

      if (event.key !== "Tab" || !dialog) return;

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
    };
  }, []);

  if (!photo) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`ภาพบรรยากาศ${clubName}`}
      className="animate-in fade-in fixed inset-0 z-50 flex flex-col bg-black/85 duration-200 motion-reduce:animate-none"
    >
      {/* Backdrop — a sibling rather than a parent so clicks on the photo don't bubble out.
          Kept out of the tab order (and off the focus trap's list) the same way Navbar's
          drawer scrim is; Escape and the × button are the keyboard routes out. */}
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0" />

      <div className="relative flex items-center justify-end p-4">
        <button type="button" aria-label="ปิด" onClick={onClose} className={CONTROL_CLASS}>
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>

      <div className="pointer-events-none relative flex flex-1 items-center justify-center px-4 pb-4">
        <div className="relative h-full w-full">
          <Image
            key={photo}
            src={photo}
            alt={`ภาพบรรยากาศ${clubName} รูปที่ ${index + 1}`}
            fill
            sizes="90vw"
            className="animate-in fade-in object-contain duration-200 motion-reduce:animate-none"
          />
        </div>
      </div>

      {hasMultiple && (
        <>
          <button
            type="button"
            aria-label="ภาพก่อนหน้า"
            onClick={() => onNavigate((index - 1 + photos.length) % photos.length)}
            className={`${CONTROL_CLASS} absolute top-1/2 left-4 -translate-y-1/2`}
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <button
            type="button"
            aria-label="ภาพถัดไป"
            onClick={() => onNavigate((index + 1) % photos.length)}
            className={`${CONTROL_CLASS} absolute top-1/2 right-4 -translate-y-1/2`}
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>

          <p
            aria-live="polite"
            className="font-ibm-plex pointer-events-none relative pb-6 text-center text-sm leading-[23px] font-medium text-white/70"
          >
            {index + 1} / {photos.length}
          </p>
        </>
      )}
    </div>
  );
}
