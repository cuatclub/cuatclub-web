"use client";

import { Select } from "@/components/ui/Select";
import type { ClubSortOption } from "@/server/api/modules/clubs/dto";

const SORT_LABELS: Record<ClubSortOption, string> = {
  NAME_ASC: "ชื่อ ก → ฮ",
  NAME_DESC: "ชื่อ ฮ → ก",
};

const OPTIONS = Object.values(SORT_LABELS);

const toSortOption = (label: string): ClubSortOption =>
  label === SORT_LABELS.NAME_DESC ? "NAME_DESC" : "NAME_ASC";

type ClubSortSelectProps = {
  value: ClubSortOption;
  onValueChange: (sort: ClubSortOption) => void;
};

/** Orders the list by club name. The `Select` speaks in labels, so map them to API values here. */
export function ClubSortSelect({ value, onValueChange }: ClubSortSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-ibm-plex text-foreground shrink-0 text-sm leading-[23px] md:text-base md:leading-[26px]">
        เรียงจาก
      </span>
      <Select
        options={OPTIONS}
        value={SORT_LABELS[value]}
        onValueChange={(label) => onValueChange(toSortOption(label))}
        className="w-[172px]"
      />
    </div>
  );
}
