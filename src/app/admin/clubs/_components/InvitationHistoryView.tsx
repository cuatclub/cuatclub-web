"use client";

import { useEffect, useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";

import { api, type RouterOutputs } from "@/trpc/react";
import { Card, Pagination } from "@/components";

const PAGE_SIZE = 20;

type HistoryItem = RouterOutputs["invitations"]["getAll"]["invitations"][number];

const statusLabel: Record<HistoryItem["status"], string> = {
  PENDING: "รอใช้งาน",
  USED: "ใช้งานแล้ว",
  EXPIRED: "หมดอายุ",
};

const statusClass: Record<HistoryItem["status"], string> = {
  PENDING: "bg-primary-lighter/50 text-primary",
  USED: "bg-success/10 text-success",
  EXPIRED: "bg-red-50 text-error",
};

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });

export function InvitationHistoryView({ search }: { search: string }) {
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [search]);

  const { data, isLoading, isError } = api.invitations.getAll.useQuery(
    { search: search.trim() || undefined, page, pageSize: PAGE_SIZE },
    { placeholderData: keepPreviousData }
  );

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <Card className="gap-0 overflow-hidden py-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead className="border-border border-b">
              <tr>
                <th className="text-foreground-muted px-4 py-3 text-sm font-medium">อีเมล</th>
                <th className="text-foreground-muted px-4 py-3 text-sm font-medium">รหัสเชิญ</th>
                <th className="text-foreground-muted px-4 py-3 text-sm font-medium">สถานะ</th>
                <th className="text-foreground-muted px-4 py-3 text-sm font-medium">รับโดย</th>
                <th className="text-foreground-muted px-4 py-3 text-sm font-medium">
                  วันที่ออกรหัส
                </th>
                <th className="text-foreground-muted px-4 py-3 text-sm font-medium">วันหมดอายุ</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="text-foreground-muted px-4 py-8 text-center text-sm">
                    กำลังโหลด...
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={6} className="text-error px-4 py-8 text-center text-sm">
                    โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
                  </td>
                </tr>
              )}
              {!isLoading && !isError && data?.invitations.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-foreground-muted px-4 py-8 text-center text-sm">
                    ไม่พบประวัติการเชิญ
                  </td>
                </tr>
              )}
              {data?.invitations.map((item) => (
                <tr key={item.id} className="border-border border-b last:border-b-0">
                  <td className="text-foreground px-4 py-3 text-sm md:text-base">{item.email}</td>
                  <td className="font-ibm-plex text-foreground px-4 py-3 text-sm font-medium tracking-widest md:text-base">
                    {item.inviteCode}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusClass[item.status]}`}
                    >
                      {statusLabel[item.status]}
                    </span>
                  </td>
                  <td className="text-foreground-muted px-4 py-3 text-sm md:text-base">
                    {item.redeemedByClub?.name ?? "-"}
                  </td>
                  <td className="text-foreground-muted px-4 py-3 text-sm md:text-base">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="text-foreground-muted px-4 py-3 text-sm md:text-base">
                    {formatDate(item.expiredAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
