"use client";

import { X } from "lucide-react";

import {
  ClubAbout,
  ClubContacts,
  ClubGallery,
  ClubHeader,
} from "@/app/(site)/clubs/[clubId]/_components";
import { DialogClose, DialogContent, DialogRoot, DialogTitle } from "@/components";
import { api } from "@/trpc/react";

type ClubDetailDialogProps = {
  clubId: string | null;
  onClose: () => void;
};

export function ClubDetailDialog({ clubId, onClose }: ClubDetailDialogProps) {
  const {
    data: club,
    isLoading,
    isError,
  } = api.clubs.getById.useQuery({ clubId: clubId ?? "" }, { enabled: !!clubId });

  const about = club && (club.longDescription ?? club.shortDescription);

  return (
    <DialogRoot open={!!clubId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-y-auto p-0">
        <div className="border-border sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-white px-5 py-4 md:px-6">
          <DialogTitle className="text-primary">{club?.name ?? "รายละเอียดชมรม"}</DialogTitle>
          <DialogClose
            aria-label="ปิด"
            className="text-placeholder hover:text-foreground focus-visible:ring-primary shrink-0 cursor-pointer rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <X aria-hidden="true" className="size-5" />
          </DialogClose>
        </div>

        <div className="flex flex-col gap-6 px-5 py-5 md:px-6 md:py-6">
          {isLoading && (
            <p className="text-foreground-muted py-10 text-center text-sm">กำลังโหลด...</p>
          )}
          {isError && (
            <p className="text-error py-10 text-center text-sm">
              โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
            </p>
          )}

          {club && (
            <>
              <ClubHeader
                name={club.name}
                logoUrl={club.logoUrl}
                affiliation={club.affiliation}
                categories={club.categories}
              />

              {about && <ClubAbout description={about} />}

              {club.imageUrls.length > 0 && (
                <ClubGallery photos={club.imageUrls} clubName={club.name} />
              )}

              {club.contacts && <ClubContacts contacts={club.contacts} clubName={club.name} />}
            </>
          )}
        </div>
      </DialogContent>
    </DialogRoot>
  );
}
