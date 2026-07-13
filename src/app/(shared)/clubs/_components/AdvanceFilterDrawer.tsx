"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterMultiSelect, type FilterOption } from "./FilterMultiSelect";

const FOCUSABLE =
	'button:not([disabled]), input:not([disabled]), [href], select, textarea, [tabindex]:not([tabindex="-1"])';

type AdvanceFilterDrawerProps = {
	open: boolean;
	onClose: () => void;
	faculties: FilterOption[];
	/** The drawer's "Category" list. These are `interest` rows, not `organization.category`. */
	interests: FilterOption[];
	appliedFacultyIds: string[];
	appliedInterestIds: string[];
	onApply: (facultyIds: string[], interestIds: string[]) => void;
	isLoadingOptions: boolean;
};

export function AdvanceFilterDrawer({
	open,
	onClose,
	faculties,
	interests,
	appliedFacultyIds,
	appliedInterestIds,
	onApply,
	isLoadingOptions,
}: AdvanceFilterDrawerProps) {
	const panelRef = useRef<HTMLDivElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	// Draft, not live (FR-4): nothing behind the drawer moves until Search is pressed, and
	// reopening shows whatever is actually applied — so ← and ESC discard.
	const [draftFacultyIds, setDraftFacultyIds] = useState<string[]>(appliedFacultyIds);
	const [draftInterestIds, setDraftInterestIds] = useState<string[]>(appliedInterestIds);

	// Both effects below key on `open` alone. They must fire on the open/close transition and at no
	// other time: a parent re-render (a background refetch, the taxonomy landing) must not reset the
	// user's half-made selections, nor snatch focus back out of the list they are tabbing through.
	// So the values they read live in refs rather than the dependency array.
	const latest = useRef({ onClose, appliedFacultyIds, appliedInterestIds });
	latest.current = { onClose, appliedFacultyIds, appliedInterestIds };

	useEffect(() => {
		if (!open) return;
		setDraftFacultyIds(latest.current.appliedFacultyIds);
		setDraftInterestIds(latest.current.appliedInterestIds);
	}, [open]);

	useEffect(() => {
		if (!open) return;

		const panel = panelRef.current;
		// Whatever opened the drawer — the filter button — gets focus back on close (FR-12).
		const previouslyFocused = document.activeElement as HTMLElement | null;
		closeButtonRef.current?.focus();

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				latest.current.onClose();
				return;
			}
			if (event.key !== "Tab" || !panel) return;

			const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
			const first = focusables[0];
			const last = focusables[focusables.length - 1];
			if (!first || !last) return;

			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};

		document.addEventListener("keydown", onKeyDown);
		document.body.style.overflow = "hidden";

		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.body.style.overflow = "";
			previouslyFocused?.focus();
		};
	}, [open]);

	return (
		<>
			{/*
			 * The page behind fades toward white rather than dimming to black, as drawn. Both this and
			 * the panel sit below the sticky navbar, so the drawer starts under it — also as drawn.
			 */}
			<div
				aria-hidden
				onClick={onClose}
				className={cn(
					"fixed inset-0 z-40 bg-white/70 transition-opacity duration-300 motion-reduce:transition-none",
					open ? "opacity-100" : "pointer-events-none opacity-0",
				)}
			/>

			<div
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-label="Advance Filter"
				// `inert` (not `visibility: hidden`) is what keeps the closed panel out of the tab order
				// and the a11y tree. Hiding it would make it unfocusable at the very moment it opens —
				// React flushes this component's effect inside the click, before the style lands, so the
				// close button would silently refuse focus and the trap would never engage.
				inert={!open}
				className={cn(
					// Starts below the navbar and runs to the bottom of the viewport, as drawn. The
					// navbar is sticky at z-9999, so a panel that began at top-0 would just be painted
					// over by it — the drawer's own title would end up behind the nav links.
					"fixed top-14 right-0 z-50 flex h-[calc(100%-3.5rem)] w-full flex-col bg-white sm:top-20 sm:h-[calc(100%-5rem)] sm:w-[70%] lg:w-[45%]",
					"shadow-[-4px_0_16px_rgba(0,0,0,0.06)]",
					"transition-transform duration-300 ease-out motion-reduce:transition-none",
					open ? "translate-x-0" : "pointer-events-none translate-x-full",
				)}
			>
				<div className="relative flex items-center justify-center px-6 pt-9 pb-6 sm:px-8">
					<button
						ref={closeButtonRef}
						type="button"
						aria-label="Close filters"
						onClick={onClose}
						className="absolute left-6 flex size-9 cursor-pointer items-center justify-center rounded-md text-[#393e41] transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none motion-reduce:transition-none sm:left-8"
					>
						<ArrowLeft className="size-5" />
					</button>
					<h2 className="text-xl font-semibold text-[#393e41]">Advance Filter</h2>
				</div>

				<div className="flex-1 overflow-y-auto px-6 pb-10 sm:px-8">
					<div className="flex flex-col gap-5">
						<FilterMultiSelect
							label="Faculty"
							placeholder="Choose Faculty"
							options={faculties}
							selected={draftFacultyIds}
							onChange={setDraftFacultyIds}
							isLoading={isLoadingOptions}
						/>
						<FilterMultiSelect
							label="Category"
							placeholder="Choose Category"
							options={interests}
							selected={draftInterestIds}
							onChange={setDraftInterestIds}
							isLoading={isLoadingOptions}
						/>
					</div>

					<div className="mt-30 flex flex-col gap-2">
						<button
							type="button"
							onClick={() => onApply(draftFacultyIds, draftInterestIds)}
							className="h-12 w-full cursor-pointer rounded-full bg-primary text-base font-semibold text-white transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
						>
							Search
						</button>
						{/* Clears the two fields only — the keyword lives outside the drawer (FR-4). */}
						<button
							type="button"
							onClick={() => {
								setDraftFacultyIds([]);
								setDraftInterestIds([]);
							}}
							className="h-12 w-full cursor-pointer rounded-full border border-stroke bg-white text-base text-text-gray transition-colors hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
						>
							Reset
						</button>
					</div>
				</div>
			</div>
		</>
	);
}
