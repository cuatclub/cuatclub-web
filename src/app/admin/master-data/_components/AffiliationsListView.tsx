"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { api, type RouterOutputs } from "@/trpc/react";
import { Card, ConfirmModal } from "@/components";
import { EditAffiliationDialog } from "@/app/admin/master-data/_components/EditAffiliationDialog";

type Affiliation = RouterOutputs["masterData"]["affiliations"]["getAll"][number];

const DEFAULT_DELETE_ERROR = "ไม่สามารถลบหน่วยงานสังกัดนี้ได้ กรุณาลองใหม่อีกครั้ง";

export function AffiliationsListView() {
  const [editing, setEditing] = useState<Affiliation | null>(null);
  const [deleting, setDeleting] = useState<Affiliation | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const utils = api.useUtils();
  const { data, isLoading, isError } = api.masterData.affiliations.getAll.useQuery({});

  const deleteAffiliation = api.masterData.affiliations.delete.useMutation();

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteError(null);
    try {
      await deleteAffiliation.mutateAsync({ id: deleting.id });
      await utils.masterData.affiliations.getAll.invalidate();
      setDeleting(null);
    } catch (cause) {
      setDeleteError(
        cause instanceof Error && cause.message ? cause.message : DEFAULT_DELETE_ERROR
      );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {deleteError && (
        <p role="alert" className="text-error text-sm">
          {deleteError}
        </p>
      )}

      <Card className="gap-0 overflow-hidden py-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-120 text-left">
            <thead className="border-border border-b">
              <tr>
                <th className="text-foreground-muted px-4 py-3 text-sm font-medium">ชื่อ</th>
                <th className="text-foreground-muted px-4 py-3 text-sm font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={2} className="text-foreground-muted px-4 py-8 text-center text-sm">
                    กำลังโหลด...
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={2} className="text-error px-4 py-8 text-center text-sm">
                    โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
                  </td>
                </tr>
              )}
              {!isLoading && !isError && data?.length === 0 && (
                <tr>
                  <td colSpan={2} className="text-foreground-muted px-4 py-8 text-center text-sm">
                    ไม่พบหน่วยงานสังกัด
                  </td>
                </tr>
              )}
              {data?.map((affiliation) => (
                <tr key={affiliation.id} className="border-border border-b last:border-b-0">
                  <td className="text-foreground px-4 py-3 text-sm md:text-base">
                    {affiliation.label}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        aria-label={`แก้ไข${affiliation.label}`}
                        onClick={() => setEditing(affiliation)}
                        className="text-foreground-muted hover:bg-primary-lighter hover:text-primary focus-visible:ring-primary inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none"
                      >
                        <Pencil aria-hidden="true" className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`ลบ${affiliation.label}`}
                        onClick={() => {
                          setDeleteError(null);
                          setDeleting(affiliation);
                        }}
                        className="text-foreground-muted hover:bg-error/10 hover:text-error focus-visible:ring-error inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none"
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <EditAffiliationDialog affiliation={editing} onClose={() => setEditing(null)} />

      <ConfirmModal
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="ลบหน่วยงานสังกัด"
        description={`คุณต้องการลบหน่วยงานสังกัด "${deleting?.label ?? ""}" ใช่หรือไม่ การลบจะไม่สามารถกู้คืนได้`}
        confirmLabel="ลบหน่วยงานสังกัด"
        isLoading={deleteAffiliation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
