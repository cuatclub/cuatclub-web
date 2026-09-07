"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, Trash2 } from "lucide-react";

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
    <div className="flex w-full flex-col gap-2">
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
          "border-placeholder bg-surface peer-focus-visible:border-primary relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-dashed transition-colors",
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
          <label
            htmlFor={inputId}
            className={cn(
              "text-placeholder flex size-full cursor-pointer flex-col items-center justify-center gap-3 px-6 text-center",
              disabled && "pointer-events-none cursor-not-allowed"
            )}
          >
            <ImageIcon className="size-12" aria-hidden="true" />
            <span className="font-ibm-plex text-sm leading-[23px] md:text-base">
              คลิกเพื่ออัปโหลดรูปโปสเตอร์
            </span>
          </label>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
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
        {value && !disabled && (
          <label
            htmlFor={inputId}
            className="border-placeholder text-placeholder font-ibm-plex flex h-9 shrink-0 cursor-pointer items-center rounded-lg border bg-white px-4 text-sm leading-[23px] font-semibold"
          >
            เปลี่ยนรูป
          </label>
        )}
      </div>
    </div>
  );
}
