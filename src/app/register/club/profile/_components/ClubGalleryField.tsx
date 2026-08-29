"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";

import { Button } from "@/components/ui";
import { MAX_ATMOSPHERE_PHOTOS } from "@/app/register/club/profile/profile-schema";
import { cn } from "@/lib/utils";

const IMAGE_ACCEPT = ".png,.jpg,.jpeg,.heic,image/png,image/jpeg,image/heic";

type ClubGalleryFieldProps = {
  value: File[];
  errorMessage?: string;
  disabled?: boolean;
  onAddFiles: (files: File[]) => void;
  onRemove: (index: number) => void;
};

function GalleryPreview({ file }: { file: File }) {
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
      alt={`ตัวอย่างรูปบรรยากาศ ${file.name}`}
      width={128}
      height={128}
      unoptimized
      className="size-full object-cover"
    />
  );
}

export function ClubGalleryField({
  value,
  errorMessage,
  disabled = false,
  onAddFiles,
  onRemove,
}: ClubGalleryFieldProps) {
  const inputId = useId();
  const helperId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const describedBy = [helperId, errorMessage ? errorId : undefined].filter(Boolean).join(" ");

  const handleSelection = (files: FileList | null) => {
    const selectedFiles = files ? Array.from(files) : [];
    if (selectedFiles.length > 0) onAddFiles(selectedFiles);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="font-ibm-plex text-foreground text-sm leading-[23px] font-medium md:text-base md:leading-[26px]">
        รูปบรรยากาศชมรม (สูงสุด {MAX_ATMOSPHERE_PHOTOS} รูป)
      </span>

      <div className="flex flex-wrap gap-3">
        {value.map((file, index) => (
          <div
            key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
            className="bg-surface relative size-30 shrink-0 overflow-hidden rounded-lg"
          >
            <GalleryPreview file={file} />
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              aria-label={`ลบรูป ${file.name || `ลำดับที่ ${index + 1}`}`}
              className="absolute top-1.5 right-1.5 size-8 bg-white/90 p-0"
              onClick={() => onRemove(index)}
            >
              <X className="size-4" aria-hidden="true" />
            </Button>
          </div>
        ))}

        {value.length < MAX_ATMOSPHERE_PHOTOS && (
          <div className="size-30 shrink-0">
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept={IMAGE_ACCEPT}
              multiple
              disabled={disabled}
              aria-label="เพิ่มรูปบรรยากาศชมรม"
              aria-invalid={!!errorMessage}
              aria-describedby={describedBy}
              className="peer sr-only"
              onChange={(event) => handleSelection(event.currentTarget.files)}
            />
            <label
              htmlFor={inputId}
              aria-disabled={disabled}
              className="border-primary bg-primary-lighter/30 hover:bg-primary-lighter/50 peer-focus-visible:ring-primary peer-disabled:border-placeholder peer-disabled:bg-border flex size-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:outline-none peer-disabled:pointer-events-none peer-disabled:cursor-not-allowed"
            >
              <ImagePlus
                className={cn("text-primary size-6", disabled && "text-placeholder")}
                aria-hidden="true"
              />
            </label>
          </div>
        )}
      </div>

      <p id={helperId} className="font-ibm-plex text-placeholder text-xs leading-[23px] md:text-sm">
        รองรับ PNG, JPG/JPEG และ HEIC ขนาดไฟล์ละไม่เกิน 10 MB
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
  );
}
