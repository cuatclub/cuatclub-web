"use client";

import { useState, type FormEvent, type RefObject } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

const PLACEHOLDER = "ค้นหาชื่อ หมวดหมู่ หรือสังกัด";

type ClubSearchBarProps = {
  /** The search term currently applied to the list. */
  defaultValue: string;
  onSearch: (search: string) => void;
  onToggleFilters: () => void;
  /** The filter panel drops out of this bar, so the button announces itself as its trigger. */
  isFilterOpen: boolean;
  filterButtonRef: RefObject<HTMLButtonElement | null>;
  /** Drawn on the filter button, because a closed panel hides what it is filtering by. */
  activeFilterCount: number;
};

/**
 * Searching is explicit — the visitor types, then presses Enter or the search button. The list
 * doesn't re-query on every keystroke, so a half-typed word never blanks out the results.
 *
 * Holds the in-progress text itself. Remount it (via a `key` on the applied search term) to
 * reset the field when the URL changes from somewhere else, such as the back button.
 */
export function ClubSearchBar({
  defaultValue,
  onSearch,
  onToggleFilters,
  isFilterOpen,
  filterButtonRef,
  activeFilterCount,
}: ClubSearchBarProps) {
  const [draft, setDraft] = useState(defaultValue);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(draft.trim());
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="bg-surface focus-within:ring-primary flex h-[50px] w-full items-center gap-2 rounded-full pr-2 pl-5 focus-within:ring-2"
    >
      <label htmlFor="club-search" className="sr-only">
        ค้นหาชมรม
      </label>
      <input
        id="club-search"
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={PLACEHOLDER}
        className="font-ibm-plex text-foreground placeholder:text-placeholder h-full min-w-0 flex-1 bg-transparent text-sm leading-[23px] outline-none md:text-base md:leading-[26px]"
      />

      <span aria-hidden="true" className="bg-placeholder h-6 w-px shrink-0" />

      <button
        ref={filterButtonRef}
        type="button"
        onClick={onToggleFilters}
        aria-haspopup="dialog"
        aria-expanded={isFilterOpen}
        aria-label={activeFilterCount > 0 ? `ตัวกรอง (${activeFilterCount})` : "ตัวกรอง"}
        className="text-foreground-muted hover:bg-primary-lighter hover:text-primary focus-visible:ring-primary relative flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        <SlidersHorizontal aria-hidden="true" className="size-5" />
        {activeFilterCount > 0 && (
          <span
            aria-hidden="true"
            className="bg-primary font-ibm-plex absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[10px] leading-none font-semibold text-white"
          >
            {activeFilterCount}
          </span>
        )}
      </button>

      <button
        type="submit"
        aria-label="ค้นหา"
        className="bg-primary hover:bg-primary/90 focus-visible:ring-primary flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <Search aria-hidden="true" className="size-4" />
      </button>
    </form>
  );
}
