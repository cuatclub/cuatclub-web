"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { Trash2, Upload } from "lucide-react";

import { cn } from "@/lib/utils";

const IMAGE_ACCEPT = ".png,.jpg,.jpeg,image/png,image/jpeg";

type PostPosterFieldProps = {
  value: File | null;
  errorMessage?: string;
  disabled?: boolean;
  onChange: (file: File | null) => void;
};

function PosterPreview({ file }: { file: File }) {
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
      alt={`ตัวอย่างโปสเตอร์ ${file.name}`}
      fill
      unoptimized
      className="object-cover"
    />
  );
}

export function PostPosterField({
  value,
  errorMessage,
  disabled = false,
  onChange,
}: PostPosterFieldProps) {
  const inputId = useId();
  const helperId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelection = (files: FileList | null) => {
    const selectedFile = files?.item(0) ?? null;
    if (selectedFile) onChange(selectedFile);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex w-full max-w-[282px] flex-col gap-2">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={IMAGE_ACCEPT}
        disabled={disabled}
        aria-invalid={!!errorMessage}
        aria-describedby={helperId}
        className="peer sr-only"
        onChange={(event) => handleSelection(event.currentTarget.files)}
      />

      <div
        className={cn(
          "bg-primary/5 border-primary peer-focus-visible:ring-primary relative flex aspect-[282/360] w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-xl border-2 border-dashed peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2",
          errorMessage && "border-error",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        {value ? (
          <>
            <PosterPreview file={value} />
            {!disabled && (
              <button
                type="button"
                aria-label="ลบรูปโปสเตอร์"
                className="border-placeholder text-foreground-muted hover:border-primary hover:text-primary absolute top-3 right-3 flex size-9 cursor-pointer items-center justify-center rounded-lg border bg-white/90 transition-colors"
                onClick={() => onChange(null)}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-2.5">
              <Upload className="text-primary size-12" aria-hidden="true" />
              <span className="font-ibm-plex text-primary text-base leading-6 font-medium">
                อัพโหลดโปสเตอร์ที่นี่
              </span>
            </div>
            <label
              htmlFor={inputId}
              className={cn(
                "bg-primary font-ibm-plex flex h-[39px] cursor-pointer items-center rounded-lg px-6 text-base font-semibold text-white",
                disabled && "pointer-events-none cursor-not-allowed"
              )}
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
