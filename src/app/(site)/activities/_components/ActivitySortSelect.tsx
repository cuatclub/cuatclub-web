"use client";

import { useId } from "react";

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
  CREATED_AT_DESC: "ใหม่สุด → เก่าสุด",
  CREATED_AT_ASC: "เก่าสุด → ใหม่สุด",
};

const OPTIONS = Object.values(SORT_LABELS);

const toSortOption = (label: string): ActivitySortOption =>
  label === SORT_LABELS.CREATED_AT_ASC ? "CREATED_AT_ASC" : "CREATED_AT_DESC";

type ActivitySortSelectProps = {
  value: ActivitySortOption;
  onValueChange: (sort: ActivitySortOption) => void;
  /** Overrides the select's width — the filter panel gives it the full column. */
  className?: string;
};

/**
 * Orders the list by when an activity was posted. The `Select` speaks in labels, so map them to
 * API values here.
 */
export function ActivitySortSelect({ value, onValueChange, className }: ActivitySortSelectProps) {
  const labelId = useId();
  const triggerId = useId();

  return (
    <div className="flex items-center gap-2">
      <span
        id={labelId}
        className="font-ibm-plex text-foreground shrink-0 text-sm leading-[23px] md:text-base md:leading-[26px]"
      >
        เรียงจาก
      </span>
      <SelectRoot
        value={SORT_LABELS[value]}
        onValueChange={(label) => onValueChange(toSortOption(label))}
      >
        <SelectTrigger
          id={triggerId}
          aria-labelledby={`${labelId} ${triggerId}`}
          className={cn("w-[172px]", className)}
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
    </div>
  );
}
