"use client";

import { useRef, useState, type FormEvent } from "react";
import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

const PLACEHOLDER = "ค้นหา";

type PostSearchBarProps = {
  /** The search term currently applied to the list. */
  defaultValue: string;
  onSearch: (search: string) => void;
  className?: string;
};

/**
 * Searching is explicit — type, then press Enter. The list doesn't re-query on every keystroke,
 * so a half-typed word never blanks out the results (see `ClubSearchBar`'s own comment for the
 * same rule on the public club list).
 *
 * Simpler than `ClubSearchBar`: this page has no filter panel or active-filter badge, and the
 * Figma frame has no visible submit control — just the icon inside the field — so there's no
 * trailing trigger button, only the clear ("x") button once there's a draft.
 */
export function PostSearchBar({ defaultValue, onSearch, className }: PostSearchBarProps) {
  const [draft, setDraft] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(draft.trim());
  };

  const handleClear = () => {
    setDraft("");
    inputRef.current?.focus();
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn(
        "border-border focus-within:border-primary flex h-10 w-full items-center gap-2 rounded-lg border bg-white pr-3 pl-4 transition-colors",
        className
      )}
    >
      <label htmlFor="post-search" className="sr-only">
        ค้นหาโพสต์
      </label>
      <Search aria-hidden="true" className="text-placeholder size-4 shrink-0 md:size-5" />
      <input
        ref={inputRef}
        id="post-search"
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={PLACEHOLDER}
        className="font-ibm-plex text-foreground placeholder:text-placeholder h-full min-w-0 flex-1 bg-transparent text-sm leading-[23px] outline-none md:text-base md:leading-[26px] [&::-webkit-search-cancel-button]:appearance-none"
      />

      {draft.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="ล้างคำค้นหา"
          className="text-placeholder hover:text-foreground-muted focus-visible:ring-primary flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      )}
    </form>
  );
}
