"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterOption {
	id: string;
	name: string;
}

export interface FilterSelection {
	facultyIds: string[];
	interestIds: string[];
}

interface AdvanceFilterProps {
	open: boolean;
	onClose: () => void;
	faculties: FilterOption[];
	interests: FilterOption[];
	selection: FilterSelection;
	onApply: (selection: FilterSelection) => void;
}

const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);

/** Pairs with an `sr-only peer` input so the swatch can carry the visible focus ring. */
function Checkbox({ checked }: { checked: boolean }) {
	return (
		<span
			aria-hidden
			className={cn(
				"grid size-[18px] shrink-0 place-items-center rounded-[4px] border",
				"peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#DE5C8E]",
				checked ? "border-[#DE5C8E]" : "border-[#C2C3C4]",
			)}
		>
			{checked && <Check className="size-3.5 text-[#DE5C8E]" strokeWidth={3} />}
		</span>
	);
}

interface MultiSelectProps {
	label: string;
	placeholder: string;
	options: FilterOption[];
	selectedIds: string[];
	onToggle: (id: string) => void;
	searchable?: boolean;
	searchPlaceholder?: string;
	emptyText: string;
}

function MultiSelect({
	label,
	placeholder,
	options,
	selectedIds,
	onToggle,
	searchable = false,
	searchPlaceholder = "search...",
	emptyText,
}: MultiSelectProps) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const listId = useId();

	const visible = useMemo(() => {
		const needle = query.trim().toLowerCase();
		if (!needle) return options;
		return options.filter((option) => option.name.toLowerCase().includes(needle));
	}, [options, query]);

	const summary =
		selectedIds.length === 0
			? placeholder
			: options
					.filter((option) => selectedIds.includes(option.id))
					.map((option) => option.name)
					.join(", ");

	return (
		<div className="flex w-full flex-col gap-2">
			<p className="text-sm font-medium text-[#393E41]">{label}</p>

			<div className="flex w-full flex-col gap-1">
				<button
					type="button"
					aria-expanded={open}
					aria-controls={listId}
					onClick={() => setOpen((value) => !value)}
					className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-[#C2C3C4] bg-white px-3 py-2.5 text-left transition-colors hover:border-[#DE5C8E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DE5C8E]"
				>
					<span
						className={cn(
							"truncate text-base",
							selectedIds.length > 0 ? "text-[#393E41]" : "text-[#7A7E80]",
						)}
					>
						{summary}
					</span>
					<ChevronDown
						className={cn(
							"size-6 shrink-0 text-[#393E41] transition-transform duration-200 motion-reduce:transition-none",
							open && "rotate-180",
						)}
						strokeWidth={1.5}
						aria-hidden
					/>
				</button>

				{open && (
					<div id={listId} className="flex w-full flex-col rounded border border-[#C2C3C4] bg-white pb-1">
						{searchable && (
							<div className="px-1.5 pt-1.5 pb-1">
								<input
									type="search"
									value={query}
									onChange={(event) => setQuery(event.target.value)}
									placeholder={searchPlaceholder}
									aria-label={`ค้นหา${label}`}
									className="w-full rounded-md border border-[#EBECEC] px-2 py-2.5 text-base text-[#393E41] outline-none placeholder:text-[#C2C3C4] focus:border-[#DE5C8E] [&::-webkit-search-cancel-button]:hidden"
								/>
							</div>
						)}

						<div className="max-h-56 overflow-y-auto py-1">
							{visible.length === 0 ? (
								<p className="p-2.5 text-base text-[#C2C3C4]">{emptyText}</p>
							) : (
								visible.map((option) => {
									const checked = selectedIds.includes(option.id);
									return (
										<label
											key={option.id}
											className="flex w-full cursor-pointer items-center gap-2 p-2.5 transition-colors hover:bg-[#FCEFF4]"
										>
											<input
												type="checkbox"
												checked={checked}
												onChange={() => onToggle(option.id)}
												className="peer sr-only"
											/>
											<Checkbox checked={checked} />
											<span className="text-base text-[#7A7E80]">{option.name}</span>
										</label>
									);
								})
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export function AdvanceFilter({ open, onClose, faculties, interests, selection, onApply }: AdvanceFilterProps) {
	const [draft, setDraft] = useState<FilterSelection>(selection);
	const titleId = useId();

	// Re-open always starts from what is currently applied, so an abandoned edit is discarded.
	useEffect(() => {
		if (open) setDraft(selection);
	}, [open, selection]);

	useEffect(() => {
		if (!open) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKeyDown);
		const { overflow } = document.body.style;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.body.style.overflow = overflow;
		};
	}, [open, onClose]);

	if (!open) return null;

	const reset = () => setDraft({ facultyIds: [], interestIds: [] });

	return (
		<div className="fixed inset-0 z-50 flex justify-end">
			<button
				type="button"
				aria-label="ปิดตัวกรอง"
				onClick={onClose}
				className="absolute inset-0 cursor-default bg-black/50 animate-in fade-in"
			/>

			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				className="relative flex h-full w-full flex-col gap-12 overflow-y-auto bg-white py-6 pr-10 pl-[30px] shadow-[-2px_0_4px_0_rgba(0,0,0,0.15)] duration-200 animate-in slide-in-from-right sm:w-[454px] lg:w-[532px]"
			>
				<div className="flex items-center justify-between gap-4">
					<button
						type="button"
						onClick={onClose}
						aria-label="ปิดตัวกรอง"
						className="grid size-6 shrink-0 cursor-pointer place-items-center text-[#393E41] transition-colors hover:text-[#DE5C8E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DE5C8E]"
					>
						<ArrowLeft className="size-6" strokeWidth={1.5} aria-hidden />
					</button>
					<h2 id={titleId} className="text-center text-lg font-semibold text-[#393E41] sm:text-[23px]">
						Advance Filter
					</h2>
					{/* Mirrors the back button so the title stays optically centred. */}
					<span className="size-6 shrink-0" aria-hidden />
				</div>

				<div className="flex flex-1 flex-col gap-6">
					<MultiSelect
						label="Faculty"
						placeholder="Choose Faculty"
						options={faculties}
						selectedIds={draft.facultyIds}
						onToggle={(id) => setDraft((prev) => ({ ...prev, facultyIds: toggle(prev.facultyIds, id) }))}
						emptyText="ไม่พบคณะ"
					/>

					<MultiSelect
						label="Category"
						placeholder="Choose Category"
						options={interests}
						selectedIds={draft.interestIds}
						onToggle={(id) => setDraft((prev) => ({ ...prev, interestIds: toggle(prev.interestIds, id) }))}
						searchable
						emptyText="ไม่พบหมวดหมู่"
					/>

					<div className="mt-auto flex flex-col gap-2 pt-12">
						<button
							type="button"
							onClick={() => {
								onApply(draft);
								onClose();
							}}
							className="w-full cursor-pointer rounded-full bg-[#DE5C8E] px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#c94d7d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DE5C8E] sm:text-[19px]"
						>
							Search
						</button>
						<button
							type="button"
							onClick={reset}
							className="w-full cursor-pointer rounded-full border-2 border-[#C2C3C4] bg-white px-6 py-3.5 text-base font-semibold text-[#A4A6A8] transition-colors hover:border-[#A4A6A8] hover:text-[#616567] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DE5C8E] sm:text-[19px]"
						>
							Reset
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
