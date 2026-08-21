"use client";

import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";

const PLACEHOLDER = "ค้นหาชื่อ หมวดหมู่ หรือสังกัด";

type ClubSearchBarProps = {
  /** The search term currently applied to the list. */
  defaultValue: string;
  onSearch: (search: string) => void;
};

/**
 * Searching is explicit — the visitor types, then presses Enter or the search button. The list
 * doesn't re-query on every keystroke, so a half-typed word never blanks out the results.
 *
 * Holds the in-progress text itself. Remount it (via a `key` on the applied search term) to
 * reset the field when the URL changes from somewhere else, such as the back button.
 */
export function ClubSearchBar({ defaultValue, onSearch }: ClubSearchBarProps) {
  const [draft, setDraft] = useState(defaultValue);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(draft.trim());
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="border-border focus-within:border-primary hover:border-primary-light flex h-[50px] w-full items-center gap-2 rounded-full border bg-white pr-2 pl-5 transition-colors"
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
