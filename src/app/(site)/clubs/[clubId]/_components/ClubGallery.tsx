"use client";

import { useState } from "react";
import Image from "next/image";

import { PhotoLightbox } from "@/app/(site)/clubs/[clubId]/_components/PhotoLightbox";

type ClubGalleryProps = {
  photos: string[];
  clubName: string;
};

export function ClubGallery({ photos, clubName }: ClubGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section aria-label={`ภาพบรรยากาศ${clubName}`}>
      {/* The row overflows both breakpoints by design (5 photos wider than the container),
          so it scrolls horizontally with the scrollbar hidden. */}
      <ul className="no-scrollbar flex snap-x snap-mandatory items-center gap-4 overflow-x-auto">
        {photos.map((photo, index) => (
          <li key={photo} className="shrink-0 snap-start">
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={`ดูภาพบรรยากาศ${clubName} รูปที่ ${index + 1} แบบขยาย`}
              className="focus-visible:ring-primary block cursor-pointer overflow-hidden rounded-xl transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <Image
                src={photo}
                alt={`ภาพบรรยากาศ${clubName} รูปที่ ${index + 1}`}
                width={240}
                height={180}
                className="size-[140px] object-cover md:h-[180px] md:w-[240px]"
              />
            </button>
          </li>
        ))}
      </ul>

      {openIndex !== null && (
        <PhotoLightbox
          photos={photos}
          index={openIndex}
          clubName={clubName}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      )}
    </section>
  );
}
