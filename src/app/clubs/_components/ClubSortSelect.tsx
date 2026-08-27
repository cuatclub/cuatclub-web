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
  /** Overrides the select's width — the filter panel gives it the full column. */
  className?: string;
};

/**
 * Orders the list by club name. The `Select` speaks in labels, so map them to API values here.
 *
 * Composed from the primitives rather than the `Select` wrapper: its own `label` prop stacks the
 * text above the control, and this one reads inline beside it.
 */
export function ClubSortSelect({ value, onValueChange, className }: ClubSortSelectProps) {
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
        {/* Names the trigger "เรียงจาก" plus the sort it is currently on — pointing only at the
            span would drop the value, which the trigger's own text is the only thing announcing. */}
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
