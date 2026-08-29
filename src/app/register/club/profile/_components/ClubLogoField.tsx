"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";

const IMAGE_ACCEPT = ".png,.jpg,.jpeg,.heic,image/png,image/jpeg,image/heic";

type ClubLogoFieldProps = {
  value: File | null;
  errorMessage?: string;
  disabled?: boolean;
  onChange: (file: File | null) => void;
};

function LogoPreview({ file }: { file: File }) {
  const [previewUrl, setPreviewUrl] = useState<string>();

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!previewUrl) {
    return <div className="bg-surface size-full animate-pulse" aria-hidden="true" />;
  }

  return (
    <Image
      src={previewUrl}
      alt={`ตัวอย่างรูปโปรไฟล์ ${file.name}`}
      width={160}
      height={160}
      unoptimized
      className="size-full object-cover"
    />
  );
}

export function ClubLogoField({
  value,
  errorMessage,
  disabled = false,
  onChange,
}: ClubLogoFieldProps) {
  const inputId = useId();
  const helperId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const describedBy = [helperId, errorMessage ? errorId : undefined].filter(Boolean).join(" ");

  const handleSelection = (files: FileList | null) => {
    const selectedFile = files?.item(0) ?? null;
    if (selectedFile) onChange(selectedFile);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[160px_minmax(0,1fr)] md:gap-5">
      <div className="bg-surface flex size-[160px] shrink-0 items-center justify-center overflow-hidden rounded-lg">
        {value ? (
          <LogoPreview file={value} />
        ) : (
          <ImageIcon className="text-placeholder size-10" aria-hidden="true" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 md:pt-5">
        <label
          htmlFor={inputId}
          className="font-ibm-plex text-foreground text-sm leading-[23px] font-medium md:text-base md:leading-[26px]"
        >
          รูปโปรไฟล์ <span className="text-error">*</span>
        </label>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={IMAGE_ACCEPT}
          disabled={disabled}
          aria-required="true"
          aria-invalid={!!errorMessage}
          aria-describedby={describedBy}
          className="peer sr-only"
          onChange={(event) => handleSelection(event.currentTarget.files)}
        />

        <div
          className={cn(
            "border-placeholder hover:border-primary-light peer-focus-visible:border-primary flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-dashed bg-white px-3 transition-colors md:h-16 md:px-5",
            disabled && "bg-border text-placeholder hover:border-placeholder cursor-not-allowed"
          )}
        >
          <label
            htmlFor={inputId}
            aria-disabled={disabled}
            className={cn(
              "font-ibm-plex text-placeholder min-w-0 flex-1 cursor-pointer truncate text-sm leading-[23px] md:text-base md:leading-[26px]",
              disabled && "pointer-events-none cursor-not-allowed"
            )}
          >
            {value ? value.name : "รูปโปรไฟล์"}
          </label>

          <div className="flex shrink-0 items-center gap-2">
            {value && (
              <button
                type="button"
                aria-label="ลบรูปโปรไฟล์"
                disabled={disabled}
                className="border-placeholder text-placeholder hover:border-primary-light hover:text-primary focus-visible:ring-primary disabled:bg-border flex size-9 cursor-pointer items-center justify-center rounded-lg border bg-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed"
                onClick={() => onChange(null)}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            )}
            <label
              htmlFor={inputId}
              aria-disabled={disabled}
              className={cn(
                "border-placeholder text-placeholder font-ibm-plex flex h-9 shrink-0 cursor-pointer items-center rounded-lg border bg-white px-4 text-xs leading-[20px] font-semibold md:text-sm md:leading-[23px]",
                disabled && "bg-border pointer-events-none cursor-not-allowed"
              )}
            >
              อัปโหลดใหม่
            </label>
          </div>
        </div>

        <p
          id={helperId}
          className="font-ibm-plex text-placeholder text-xs leading-[23px] md:text-sm"
        >
          ขนาดไฟล์ไม่เกิน 10 MB
        </p>
        {errorMessage && (
          <p
            id={errorId}
            role="alert"
            className="font-ibm-plex text-error text-xs leading-[23px] md:text-sm"
          >
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
