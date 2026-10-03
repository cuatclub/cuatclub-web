"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

const PLACEHOLDER = "ค้นหา";
const SEARCH_DEBOUNCE_MS = 300;

type PostSearchBarProps = {
  /** The search term currently applied to the list. */
  defaultValue: string;
  onSearch: (search: string) => void;
  className?: string;
};

/**
 * Searches as the visitor types (debounced); Enter and the clear button apply immediately.
 * Syncs to `defaultValue` itself instead of being remounted via `key` like `ClubSearchBar`: the
 * debounced search changes the applied term, and a remount would drop focus mid-typing.
 */
export function PostSearchBar({ defaultValue, onSearch, className }: PostSearchBarProps) {
  const [draft, setDraft] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Last term applied or adopted — skips no-op searches and tells our own URL echo apart from Back.
  const appliedRef = useRef(defaultValue);
  // Latest onSearch, so a pending timer never navigates with stale params (e.g. an old sort).
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  });

  useEffect(() => {
    if (defaultValue === appliedRef.current) return;
    appliedRef.current = defaultValue;
    setDraft(defaultValue);
  }, [defaultValue]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const applySearch = (value: string) => {
    clearTimeout(timerRef.current);
    const term = value.trim();
    if (term === appliedRef.current) return;
    appliedRef.current = term;
    onSearchRef.current(term);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setDraft(value);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => applySearch(value), SEARCH_DEBOUNCE_MS);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applySearch(draft);
  };

  const handleClear = () => {
    setDraft("");
    applySearch("");
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
        onChange={handleChange}
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
