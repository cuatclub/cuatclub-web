"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";

import {
  MAX_ATMOSPHERE_PHOTOS,
  type ClubProfileImage,
} from "@/app/(site)/register/club/profile/profile-schema";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

const IMAGE_ACCEPT = ".png,.jpg,.jpeg,image/png,image/jpeg";

type ClubGalleryFieldProps = {
  value: ClubProfileImage[];
  errorMessage?: string;
  disabled?: boolean;
  onAddFiles: (files: File[]) => void;
  onRemove: (index: number) => void;
};

function NewGalleryPreview({ file }: { file: File }) {
  const [previewUrl, setPreviewUrl] = useState<string>();

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!previewUrl) {
    return <div className="bg-surface size-full animate-pulse rounded-lg" aria-hidden="true" />;
  }

  return (
    <Image
      src={previewUrl}
      alt={`ตัวอย่างรูปบรรยากาศ ${file.name}`}
      width={128}
      height={128}
      unoptimized
      className="size-full rounded-lg object-cover"
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
    <div className="flex flex-col gap-3">
      <span className="font-ibm-plex text-foreground text-sm leading-[23px] font-medium md:text-base md:leading-[26px]">
        รูปบรรยากาศชมรม (สูงสุด {MAX_ATMOSPHERE_PHOTOS} รูป)
      </span>

      <div className="flex flex-wrap gap-4">
        {value.map((image, index) => (
          <div
            key={
              image.kind === "persisted"
                ? image.url
                : `${image.file.name}-${image.file.size}-${image.file.lastModified}-${index}`
            }
            className="bg-surface relative size-21 shrink-0 rounded-lg md:size-30"
          >
            {image.kind === "persisted" ? (
              <Image
                src={image.url}
                alt={`รูปบรรยากาศชมรมปัจจุบัน ลำดับที่ ${index + 1}`}
                width={128}
                height={128}
                className="size-full rounded-lg object-cover"
              />
            ) : (
              <NewGalleryPreview file={image.file} />
            )}
            <Button
              type="button"
              disabled={disabled}
              aria-label={`ลบรูป ${
                image.kind === "persisted"
                  ? `ลำดับที่ ${index + 1}`
                  : image.file.name || `ลำดับที่ ${index + 1}`
              }`}
              className="bg-surface text-foreground hover:bg-border focus-visible:ring-primary disabled:bg-border disabled:text-placeholder absolute -top-2 -right-2 z-10 size-4 rounded-full p-0 shadow-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:size-8"
              onClick={() => onRemove(index)}
            >
              <X className="size-3 stroke-2 md:size-4" aria-hidden="true" />
            </Button>
          </div>
        ))}

        {value.length < MAX_ATMOSPHERE_PHOTOS && (
          <div className="size-21 shrink-0 md:size-30">
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
              className="border-primary bg-primary-lighter/30 hover:bg-primary-lighter/50 peer-focus-visible:ring-primary peer-disabled:border-placeholder peer-disabled:bg-border flex size-full cursor-pointer items-center justify-center rounded-xl border border-dashed transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:outline-none peer-disabled:pointer-events-none peer-disabled:cursor-not-allowed"
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
        รองรับ PNG, JPG/JPEG ขนาดไฟล์ละไม่เกิน 10 MB
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
