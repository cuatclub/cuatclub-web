"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";

import {
  ClubAbout,
  ClubContacts,
  ClubGallery,
  ClubHeader,
} from "@/app/(site)/clubs/[clubId]/_components";
import { EditClubForm } from "@/app/admin/clubs/_components/EditClubForm";
import {
  Button,
  ConfirmModal,
  DialogClose,
  DialogContent,
  DialogRoot,
  DialogTitle,
} from "@/components";
import { api } from "@/trpc/react";

type ClubDetailDialogProps = {
  clubId: string | null;
  onClose: () => void;
};

export function ClubDetailDialog({ clubId, onClose }: ClubDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const utils = api.useUtils();

  useEffect(() => {
    setIsEditing(false);
    setIsConfirmingDelete(false);
  }, [clubId]);

  const {
    data: club,
    isLoading,
    isError,
  } = api.clubs.getById.useQuery({ clubId: clubId ?? "" }, { enabled: !!clubId });

  const { data: affiliations } = api.masterData.affiliations.getAll.useQuery(
    {},
    { enabled: isEditing }
  );
  const { data: categories } = api.masterData.categories.getAll.useQuery(
    {},
    { enabled: isEditing }
  );

  const deleteClub = api.clubs.deleteForAdmin.useMutation();

  const handleDelete = async () => {
    if (!clubId) return;
    await deleteClub.mutateAsync({ id: clubId });
    await utils.clubs.getAllForAdmin.invalidate();
    setIsConfirmingDelete(false);
    onClose();
  };

  const about = club && (club.longDescription ?? club.shortDescription);

  return (
    <DialogRoot open={!!clubId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        placement="modal"
        className="max-h-[85vh] w-full max-w-[676px] gap-0 overflow-y-auto p-0"
      >
        <div className="border-border sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-white px-5 py-4 md:px-6">
          <DialogTitle className="text-primary">
            {isEditing ? "แก้ไขข้อมูลชมรม" : (club?.name ?? "รายละเอียดชมรม")}
          </DialogTitle>
          <div className="flex shrink-0 items-center gap-3">
            {club && !isEditing && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 gap-1.5 px-3 text-xs md:h-9 md:text-sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil aria-hidden="true" className="size-3.5" />
                  แก้ไข
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  color="destructive"
                  className="h-8 gap-1.5 px-3 text-xs md:h-9 md:text-sm"
                  onClick={() => setIsConfirmingDelete(true)}
                >
                  <Trash2 aria-hidden="true" className="size-3.5" />
                  ลบ
                </Button>
              </>
            )}
            <DialogClose
              aria-label="ปิด"
              className="text-placeholder hover:text-foreground focus-visible:ring-primary shrink-0 cursor-pointer rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <X aria-hidden="true" className="size-5" />
            </DialogClose>
          </div>
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

          {club && isEditing && clubId && (
            <>
              {affiliations && categories ? (
                <EditClubForm
                  clubId={clubId}
                  affiliations={affiliations}
                  categories={categories}
                  existingProfile={club}
                  onSaved={() => setIsEditing(false)}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <p className="text-foreground-muted py-10 text-center text-sm">กำลังโหลด...</p>
              )}
            </>
          )}

          {club && !isEditing && (
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

      <ConfirmModal
        open={isConfirmingDelete}
        onOpenChange={setIsConfirmingDelete}
        title="ลบชมรม"
        description={`คุณต้องการลบชมรม${club ? ` "${club.name}"` : ""} ใช่หรือไม่ การลบจะไม่สามารถกู้คืนได้`}
        confirmLabel="ลบชมรม"
        isLoading={deleteClub.isPending}
        onConfirm={handleDelete}
      />
    </DialogRoot>
  );
}
