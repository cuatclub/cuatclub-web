"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";

import { cn } from "@/lib/utils";

// Same placeholder the navbar shows for an account without a profile image.
const PLACEHOLDER_SRC = "/svg/user_profile.svg";

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

interface StudentAvatarFieldProps {
  /** A newly picked file, or null to show `currentUrl`. */
  file: File | null;
  /** The image the account already has (e.g. from Google sign-in). */
  currentUrl: string | null;
  errorMessage?: string;
  onChange: (file: File) => void;
}

/** Preview URL for a picked File (a revocable object URL), else the already-saved image. */
function useAvatarPreviewUrl(file: File | null, currentUrl: string | null) {
  const [objectUrl, setObjectUrl] = useState<string>();

  useEffect(() => {
    if (!file) {
      setObjectUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return file ? objectUrl : (currentUrl ?? undefined);
}

export function StudentAvatarField({
  file,
  currentUrl,
  errorMessage,
  onChange,
}: StudentAvatarFieldProps) {
  const inputId = useId();
  const helperId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useAvatarPreviewUrl(file, currentUrl);

  const handleSelection = (files: FileList | null) => {
    const selected = files?.item(0);
    if (selected) onChange(selected);
    // Reset so picking the same file again still fires onChange.
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={IMAGE_ACCEPT}
        aria-invalid={!!errorMessage}
        aria-describedby={errorMessage ? helperId : undefined}
        className="peer sr-only"
        onChange={(event) => handleSelection(event.currentTarget.files)}
      />
      <div className="peer-focus-visible:ring-primary relative size-24 rounded-full peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2">
        <label
          htmlFor={inputId}
          className={cn(
            "relative block size-full cursor-pointer overflow-hidden rounded-full",
            errorMessage && "ring-error ring-2"
          )}
        >
          <Image
            src={previewUrl ?? PLACEHOLDER_SRC}
            alt="รูปโปรไฟล์"
            fill
            unoptimized
            // Google-hosted avatars refuse to load when a Referer header is sent.
            referrerPolicy="no-referrer"
            className="object-cover"
          />
          <span className="sr-only">อัปโหลดรูปโปรไฟล์</span>
        </label>
        <span
          aria-hidden="true"
          className="bg-primary pointer-events-none absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full border-2 border-white text-white"
        >
          <Camera className="size-4" />
        </span>
      </div>
      {errorMessage && (
        <p id={helperId} role="alert" className="font-ibm-plex text-error text-xs md:text-sm">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
