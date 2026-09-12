"use client";

import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import type { ActivitySortOption } from "@/server/api/modules/activities/dto";

const SORT_LABELS: Record<ActivitySortOption, string> = {
  CREATED_AT_DESC: "ใหม่ -> เก่า",
  CREATED_AT_ASC: "เก่า -> ใหม่",
};

const OPTIONS = Object.values(SORT_LABELS);

const toSortOption = (label: string): ActivitySortOption =>
  label === SORT_LABELS.CREATED_AT_ASC ? "CREATED_AT_ASC" : "CREATED_AT_DESC";

type PostSortSelectProps = {
  value: ActivitySortOption;
  onValueChange: (sort: ActivitySortOption) => void;
  className?: string;
};

/**
 * Orders the list by when a post was created. Figma shows the select alone, with no
 * "เรียงจาก" label beside it — the trigger's own text (the current sort) is its accessible name.
 */
export function PostSortSelect({ value, onValueChange, className }: PostSortSelectProps) {
  return (
    <SelectRoot
      value={SORT_LABELS[value]}
      onValueChange={(label) => onValueChange(toSortOption(label))}
    >
      <SelectTrigger
        aria-label="เรียงจาก"
        className={cn("w-auto shrink-0 whitespace-nowrap md:w-[180px]", className)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
}
