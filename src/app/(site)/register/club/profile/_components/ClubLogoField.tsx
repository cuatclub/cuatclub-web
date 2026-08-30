"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, Trash2 } from "lucide-react";

import type { ClubProfileImage } from "@/app/(site)/register/club/profile/profile-schema";
import { cn } from "@/lib/utils";

const IMAGE_ACCEPT = ".png,.jpg,.jpeg,image/png,image/jpeg";

type ClubLogoFieldProps = {
  value: ClubProfileImage | null;
  errorMessage?: string;
  disabled?: boolean;
  onChange: (image: ClubProfileImage | null) => void;
};

function NewLogoPreview({ file }: { file: File }) {
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
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelection = (files: FileList | null) => {
    const selectedFile = files?.item(0) ?? null;
    if (selectedFile) onChange({ kind: "new", file: selectedFile });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[160px_minmax(0,1fr)] md:gap-5">
      <div className="bg-surface flex size-[160px] shrink-0 items-center justify-center overflow-hidden rounded-lg">
        {value ? (
          value.kind === "persisted" ? (
            <Image
              src={value.url}
              alt="โลโก้ชมรมปัจจุบัน"
              width={160}
              height={160}
              className="size-full object-cover"
            />
          ) : (
            <NewLogoPreview file={value.file} />
          )
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
          aria-describedby={helperId}
          className="peer sr-only"
          onChange={(event) => handleSelection(event.currentTarget.files)}
        />

        <div
          className={cn(
            "border-placeholder peer-focus-visible:border-primary flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-dashed bg-white px-3 transition-colors md:h-16 md:px-5",
            errorMessage && "border-error",
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
            {value
              ? value.kind === "persisted"
                ? "รูปโปรไฟล์ปัจจุบัน"
                : value.file.name
              : "รูปโปรไฟล์"}
          </label>

          <div className="flex shrink-0 items-center gap-2">
            {value && (
              <button
                type="button"
                aria-label="ลบรูปโปรไฟล์"
                disabled={disabled}
                className="border-placeholder text-placeholder hover:border-primary-light hover:text-primary focus-visible:ring-primary disabled:bg-border flex size-7 cursor-pointer items-center justify-center rounded-lg border bg-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed md:size-9"
                onClick={() => onChange(null)}
              >
                <Trash2 className="size-3 md:size-4" aria-hidden="true" />
              </button>
            )}
            <label
              htmlFor={inputId}
              aria-disabled={disabled}
              className={cn(
                "border-placeholder text-placeholder font-ibm-plex flex h-7 shrink-0 cursor-pointer items-center rounded-lg border bg-white px-2 text-xs leading-[20px] font-semibold md:h-9 md:px-4 md:text-sm md:leading-[23px]",
                disabled && "bg-border pointer-events-none cursor-not-allowed"
              )}
            >
              อัปโหลดใหม่
            </label>
          </div>
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
    </div>
  );
}
