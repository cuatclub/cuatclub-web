"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { keepPreviousData } from "@tanstack/react-query";
import { Building2, Search } from "lucide-react";

import { api } from "@/trpc/react";
import { Card, Input, Pagination, Tag } from "@/components";
import { ClubDetailDialog } from "@/app/admin/clubs/_components/ClubDetailDialog";
import { InviteClubDialog } from "@/app/admin/clubs/_components/InviteClubDialog";
import { InvitationHistoryView } from "@/app/admin/clubs/_components/InvitationHistoryView";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

type Tab = "clubs" | "history";

const tabClass =
  "font-ibm-plex -mb-px cursor-pointer border-b-2 border-transparent px-1 pb-3 text-sm font-medium transition-colors md:text-base";

export function AdminClubsView() {
  const [tab, setTab] = useState<Tab>("clubs");
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex w-full flex-row items-center justify-between">
        <h1 className="font-ibm-plex text-primary text-xl font-semibold md:text-2xl">จัดการชมรม</h1>
        <InviteClubDialog />
      </header>

      <div className="relative md:max-w-sm">
        <Search
          aria-hidden="true"
          className="text-placeholder pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        />
        <Input
          placeholder="ค้นหา"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-9"
        />
      </div>

      <div className="border-border flex w-full gap-6 border-b">
        <button
          type="button"
          onClick={() => setTab("clubs")}
          className={cn(
            tabClass,
            tab === "clubs"
              ? "border-primary text-primary"
              : "text-foreground-muted hover:text-primary"
          )}
        >
          ชมรมทั้งหมด
        </button>
        <button
          type="button"
          onClick={() => setTab("history")}
          className={cn(
            tabClass,
            tab === "history"
              ? "border-primary text-primary"
              : "text-foreground-muted hover:text-primary"
          )}
        >
          ประวัติการเชิญ
        </button>
      </div>

      {tab === "clubs" ? (
        <ClubsListView search={search} />
      ) : (
        <InvitationHistoryView search={search} />
      )}
    </div>
  );
}

function ClubsListView({ search }: { search: string }) {
  const [page, setPage] = useState(1);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);

  useEffect(() => setPage(1), [search]);

  const { data, isLoading, isError } = api.clubs.getAll.useQuery(
    { search: search.trim() || undefined, sort: "NAME_ASC", page, pageSize: PAGE_SIZE },
    { placeholderData: keepPreviousData }
  );

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <p className="font-ibm-plex text-foreground-muted text-sm md:text-base">
        {data ? `ทั้งหมด ${data.total} ชมรม` : "กำลังโหลด..."}
      </p>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead className="border-border border-b">
              <tr>
                <th className="text-foreground-muted px-4 py-3 text-sm font-medium">ชมรม</th>
                <th className="text-foreground-muted px-4 py-3 text-sm font-medium">อีเมล</th>
                <th className="text-foreground-muted px-4 py-3 text-sm font-medium">
                  หน่วยงานสังกัด
                </th>
                <th className="text-foreground-muted px-4 py-3 text-sm font-medium">หมวดหมู่</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4} className="text-foreground-muted px-4 py-8 text-center text-sm">
                    กำลังโหลด...
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={4} className="text-error px-4 py-8 text-center text-sm">
                    โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
                  </td>
                </tr>
              )}
              {!isLoading && !isError && data?.clubs.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-foreground-muted px-4 py-8 text-center text-sm">
                    ไม่พบชมรม
                  </td>
                </tr>
              )}
              {data?.clubs.map((club) => (
                <tr
                  key={club.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`ดูรายละเอียด${club.name}`}
                  onClick={() => setSelectedClubId(club.id)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    setSelectedClubId(club.id);
                  }}
                  className="border-border focus-visible:ring-primary cursor-pointer border-b last:border-b-0 hover:bg-gray-100 focus-visible:ring-2 focus-visible:-outline-offset-2 focus-visible:outline-none"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {club.logoUrl ? (
                        <Image
                          src={club.logoUrl}
                          alt=""
                          width={32}
                          height={32}
                          className="size-8 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="bg-primary-lighter text-primary flex size-8 shrink-0 items-center justify-center rounded-full"
                        >
                          <Building2 className="size-4" />
                        </span>
                      )}
                      <span className="font-ibm-plex text-foreground text-sm font-medium md:text-base">
                        {club.name}
                      </span>
                    </div>
                  </td>
                  <td className="text-foreground-muted px-4 py-3 text-sm md:text-base">
                    {club.email}
                  </td>
                  <td className="text-foreground-muted px-4 py-3 text-sm md:text-base">
                    {club.affiliation?.label ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {club.categories.map((category) => (
                        <Tag
                          key={category.id}
                          color={category.fontColor}
                          bgColor={category.backgroundColor}
                        >
                          {category.label}
                        </Tag>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ClubDetailDialog clubId={selectedClubId} onClose={() => setSelectedClubId(null)} />
    </div>
  );
}
