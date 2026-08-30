"use client";

import { useState } from "react";

import { CategoriesListView } from "@/app/admin/master-data/_components/CategoriesListView";
import { AffiliationsListView } from "@/app/admin/master-data/_components/AffiliationsListView";
import { CreateCategoryDialog } from "@/app/admin/master-data/_components/CreateCategoryDialog";
import { CreateAffiliationDialog } from "@/app/admin/master-data/_components/CreateAffiliationDialog";
import { cn } from "@/lib/utils";

type Tab = "categories" | "affiliations";

const tabClass =
  "font-ibm-plex -mb-px cursor-pointer border-b-2 border-transparent px-1 pb-3 text-sm font-medium transition-colors md:text-base";

export function AdminMasterDataView() {
  const [tab, setTab] = useState<Tab>("categories");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex w-full flex-row items-center justify-between">
        <h1 className="font-ibm-plex text-primary text-xl font-semibold md:text-2xl">ข้อมูลหลัก</h1>
        {tab === "categories" ? <CreateCategoryDialog /> : <CreateAffiliationDialog />}
      </header>

      <div className="border-border flex w-full gap-6 border-b">
        <button
          type="button"
          onClick={() => setTab("categories")}
          className={cn(
            tabClass,
            tab === "categories"
              ? "border-primary text-primary"
              : "text-foreground-muted hover:text-primary"
          )}
        >
          หมวดหมู่
        </button>
        <button
          type="button"
          onClick={() => setTab("affiliations")}
          className={cn(
            tabClass,
            tab === "affiliations"
              ? "border-primary text-primary"
              : "text-foreground-muted hover:text-primary"
          )}
        >
          หน่วยงานสังกัด
        </button>
      </div>

      {tab === "categories" ? <CategoriesListView /> : <AffiliationsListView />}
    </div>
  );
}
