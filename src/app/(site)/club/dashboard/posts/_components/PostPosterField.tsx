"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { Trash2, Upload } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PosterFieldValue } from "@/app/(site)/club/dashboard/posts/post-schema";

const IMAGE_ACCEPT = ".png,.jpg,.jpeg,image/png,image/jpeg";

type PostPosterFieldProps = {
  value: PosterFieldValue;
  errorMessage?: string;
  onChange: (file: File | null) => void;
};

/**
 * Resolves a preview URL for either a newly picked `File` (via a revocable object URL) or an
 * already-uploaded poster passed as a URL string. Always calls the same hooks regardless of
 * which case `value` is, so the branch below can vary without breaking the rules of hooks.
 */
function usePosterPreviewUrl(value: File | string): string | undefined {
  const isFile = value instanceof File;
  const [objectUrl, setObjectUrl] = useState<string>();

  useEffect(() => {
    if (!isFile) {
      setObjectUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(value);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value, isFile]);

  return isFile ? objectUrl : value;
}

function PosterPreview({ value }: { value: File | string }) {
  const previewUrl = usePosterPreviewUrl(value);
  const alt = typeof value === "string" ? "ตัวอย่างโปสเตอร์" : `ตัวอย่างโปสเตอร์ ${value.name}`;

  if (!previewUrl) {
    return <div className="bg-surface size-full animate-pulse" aria-hidden="true" />;
  }

  return <Image src={previewUrl} alt={alt} fill unoptimized className="object-cover" />;
}

export function PostPosterField({ value, errorMessage, onChange }: PostPosterFieldProps) {
  const inputId = useId();
  const helperId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelection = (files: FileList | null) => {
    const selectedFile = files?.item(0) ?? null;
    if (selectedFile) onChange(selectedFile);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex w-full max-w-[188px] flex-col gap-2 md:max-w-[282px]">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={IMAGE_ACCEPT}
        aria-invalid={!!errorMessage}
        aria-describedby={helperId}
        className="peer sr-only"
        onChange={(event) => handleSelection(event.currentTarget.files)}
      />

      <div
        className={cn(
          "bg-primary/5 border-primary peer-focus-visible:ring-primary relative flex aspect-[282/360] w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-xl border-2 border-dashed peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2",
          errorMessage && "border-error"
        )}
      >
        {value ? (
          <>
            <PosterPreview value={value} />
            <button
              type="button"
              aria-label="ลบรูปโปสเตอร์"
              className="border-placeholder text-foreground-muted hover:border-primary hover:text-primary absolute top-3 right-3 flex size-9 cursor-pointer items-center justify-center rounded-lg border bg-white/90 transition-colors"
              onClick={() => onChange(null)}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-2.5">
              <Upload className="text-primary size-10 md:size-12" aria-hidden="true" />
              <span className="font-ibm-plex text-primary text-sm leading-6 font-medium md:text-base">
                อัพโหลดโปสเตอร์ที่นี่
              </span>
            </div>
            <label
              htmlFor={inputId}
              className="bg-primary font-ibm-plex flex h-[39px] cursor-pointer items-center rounded-lg px-6 text-base font-semibold text-white"
            >
              อัพโหลด
            </label>
          </>
        )}
      </div>

      <p
        id={helperId}
        role={errorMessage ? "alert" : undefined}
        className={cn(
          "font-ibm-plex text-xs leading-[23px] md:text-sm",
          errorMessage ? "text-error" : "text-placeholder"
        )}
      >
        {errorMessage ?? "รองรับ PNG, JPG/JPEG ขนาดไฟล์ไม่เกิน 10 MB"}
      </p>
    </div>
  );
}
