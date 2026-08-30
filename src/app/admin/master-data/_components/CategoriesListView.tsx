"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { api, type RouterOutputs } from "@/trpc/react";
import { Card, Tag } from "@/components";
import { EditCategoryDialog } from "@/app/admin/master-data/_components/EditCategoryDialog";

type Category = RouterOutputs["masterData"]["categories"]["getAll"][number];

export function CategoriesListView() {
  const [editing, setEditing] = useState<Category | null>(null);
  const { data, isLoading, isError } = api.masterData.categories.getAll.useQuery({});

  return (
    <div className="flex flex-col gap-6">
      <Card className="gap-0 overflow-hidden py-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-120 text-left">
            <thead className="border-border border-b">
              <tr>
                <th className="text-foreground-muted px-4 py-3 text-sm font-medium">ตัวอย่าง</th>
                <th className="text-foreground-muted px-4 py-3 text-sm font-medium">ชื่อ</th>
                <th className="text-foreground-muted px-4 py-3 text-sm font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={3} className="text-foreground-muted px-4 py-8 text-center text-sm">
                    กำลังโหลด...
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={3} className="text-error px-4 py-8 text-center text-sm">
                    โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
                  </td>
                </tr>
              )}
              {!isLoading && !isError && data?.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-foreground-muted px-4 py-8 text-center text-sm">
                    ไม่พบหมวดหมู่
                  </td>
                </tr>
              )}
              {data?.map((category) => (
                <tr key={category.id} className="border-border border-b last:border-b-0">
                  <td className="px-4 py-3">
                    <Tag color={category.fontColor} bgColor={category.backgroundColor}>
                      {category.label}
                    </Tag>
                  </td>
                  <td className="text-foreground px-4 py-3 text-sm md:text-base">
                    {category.label}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      aria-label={`แก้ไข${category.label}`}
                      onClick={() => setEditing(category)}
                      className="text-foreground-muted hover:bg-primary-lighter hover:text-primary focus-visible:ring-primary inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <Pencil aria-hidden="true" className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <EditCategoryDialog category={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
