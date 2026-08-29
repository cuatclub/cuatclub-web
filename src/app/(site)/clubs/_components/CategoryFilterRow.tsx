"use client";

import { useState } from "react";

import { Tag } from "@/components/ui/Tag";
import type { RouterOutputs } from "@/trpc/react";

type Category = RouterOutputs["masterData"]["categories"]["getAll"][number];

/** How many categories stay visible before the row is expanded. Matches the design's first row. */
const COLLAPSED_COUNT = 4;

type CategoryFilterRowProps = {
  categories: Category[];
  selectedIds: number[];
  onToggle: (categoryId: number) => void;
};

/**
 * Shortcut filtering by category, right above the results. Selecting here sets the same filter
 * the filter modal does — the two are two doors into one piece of state.
 */
export function CategoryFilterRow({ categories, selectedIds, onToggle }: CategoryFilterRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (categories.length === 0) return null;

  const canExpand = categories.length > COLLAPSED_COUNT;
  // Selected categories lead the row, each side keeping its alphabetical order so toggling one
  // chip moves only that chip. Reordering before the slice is also what surfaces a category
  // picked in the filter modal into the collapsed row.
  const orderedCategories = [
    ...categories.filter((category) => selectedIds.includes(category.id)),
    ...categories.filter((category) => !selectedIds.includes(category.id)),
  ];
  const visibleCategories =
    isExpanded || !canExpand ? orderedCategories : orderedCategories.slice(0, COLLAPSED_COUNT);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      {visibleCategories.map((category) => (
        <Tag
          key={category.id}
          type="selectable"
          selected={selectedIds.includes(category.id)}
          color={category.fontColor}
          bgColor={category.backgroundColor}
          onClick={() => onToggle(category.id)}
        >
          {category.label}
        </Tag>
      ))}

      {canExpand && (
        <button
          type="button"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          className="font-ibm-plex text-foreground-secondary hover:text-primary focus-visible:ring-primary cursor-pointer rounded-sm text-sm leading-[23px] font-medium underline-offset-4 transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:text-base md:leading-[26px]"
        >
          {isExpanded ? "ย่อลง" : "ดูทั้งหมด"}
        </button>
      )}
    </div>
  );
}
