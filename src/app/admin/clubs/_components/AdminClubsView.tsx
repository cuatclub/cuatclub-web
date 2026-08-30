"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components";
import { InviteClubDialog } from "@/app/admin/clubs/_components/InviteClubDialog";
import { ClubsListView } from "@/app/admin/clubs/_components/ClubsListView";
import { InvitationHistoryView } from "@/app/admin/clubs/_components/InvitationHistoryView";
import { cn } from "@/lib/utils";

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
