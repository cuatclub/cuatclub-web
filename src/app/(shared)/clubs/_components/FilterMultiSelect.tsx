"use client";

import { useId, useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterOption = { id: string; name: string };

type FilterMultiSelectProps = {
	label: string;
	placeholder: string;
	options: FilterOption[];
	selected: string[];
	onChange: (ids: string[]) => void;
	isLoading?: boolean;
};

/**
 * FR-4: a collapsible checkbox multi-select. Selections within one field OR together;
 * the two fields AND together. Nothing here applies until Search is pressed.
 *
 * The search-within-options input is on both fields, not just Category as drawn — 22 faculties
 * do not fit on screen.
 */
export function FilterMultiSelect({
	label,
	placeholder,
	options,
	selected,
	onChange,
	isLoading = false,
}: FilterMultiSelectProps) {
	const [expanded, setExpanded] = useState(false);
	const [query, setQuery] = useState("");
	const listId = useId();

	const visibleOptions = useMemo(() => {
		const needle = query.trim().toLowerCase();
		if (!needle) return options;
		return options.filter((option) => option.name.toLowerCase().includes(needle));
	}, [options, query]);

	const selectedNames = options
		.filter((option) => selected.includes(option.id))
		.map((option) => option.name);

	const toggle = (id: string) => {
		onChange(selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id]);
	};

	return (
		<div className="flex flex-col gap-2">
			<span className="text-sm font-medium text-[#393e41]">{label}</span>

			<button
				type="button"
				aria-expanded={expanded}
				aria-controls={listId}
				disabled={isLoading}
				onClick={() => setExpanded((open) => !open)}
				className={cn(
					"flex h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-[8px] border border-stroke bg-white px-4 text-left transition-colors",
					"hover:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
					"disabled:cursor-not-allowed disabled:opacity-60",
					"motion-reduce:transition-none",
				)}
			>
				{/*
				 * Expanded, the ticks already say what is selected, so the trigger keeps its
				 * placeholder — as drawn. Collapsed, the ticks are gone and the selection would be
				 * invisible, so it summarises instead.
				 */}
				<span
					className={cn(
						"min-w-0 flex-1 truncate text-[15px]",
						!expanded && selectedNames.length > 0 ? "text-[#393e41]" : "text-text-gray",
					)}
				>
					{!expanded && selectedNames.length > 0 ? selectedNames.join(", ") : placeholder}
				</span>
				<ChevronDown
					aria-hidden
					className={cn(
						"size-5 shrink-0 text-text-gray transition-transform duration-200 motion-reduce:transition-none",
						expanded && "rotate-180",
					)}
				/>
			</button>

			{expanded && (
				<div id={listId} className="rounded-[8px] border border-stroke bg-white p-2">
					<label className="sr-only" htmlFor={`${listId}-search`}>
						Search {label.toLowerCase()} options
					</label>
					<input
						id={`${listId}-search`}
						type="text"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="search..."
						className="mb-1 h-9 w-full rounded-[6px] border border-[#ececec] px-3 text-sm text-[#393e41] transition-colors placeholder:text-text-light-gray focus:border-primary focus:outline-none motion-reduce:transition-none"
					/>

					<div className="max-h-[236px] overflow-y-auto">
						{visibleOptions.length === 0 ? (
							<p className="px-2 py-3 text-sm text-text-gray">No matches for “{query}”.</p>
						) : (
							visibleOptions.map((option) => {
								const checked = selected.includes(option.id);
								return (
									<label
										key={option.id}
										className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 hover:bg-[#fff7fa]"
									>
										{/* Real checkbox, visually replaced — keeps it keyboard-operable (FR-12). */}
										<input
											type="checkbox"
											checked={checked}
											onChange={() => toggle(option.id)}
											className="peer sr-only"
										/>
										<span
											aria-hidden
											className={cn(
												"flex size-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-colors",
												"peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2",
												"motion-reduce:transition-none",
												checked ? "border-primary bg-primary text-white" : "border-stroke bg-white",
											)}
										>
											{checked && <Check className="size-3" strokeWidth={3.5} />}
										</span>
										<span className="text-[15px] text-[#393e41]">{option.name}</span>
									</label>
								);
							})
						)}
					</div>
				</div>
			)}
		</div>
	);
}
