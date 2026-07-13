"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PageButtonProps = {
	label: string;
	disabled: boolean;
	onClick: () => void;
	children: React.ReactNode;
};

function PageButton({ label, disabled, onClick, children }: PageButtonProps) {
	return (
		<button
			type="button"
			aria-label={label}
			disabled={disabled}
			onClick={onClick}
			className={cn(
				"flex size-8 cursor-pointer items-center justify-center rounded-md text-[#616567] transition-colors",
				"hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
				"disabled:pointer-events-none disabled:text-[#d0d1d2]",
				"motion-reduce:transition-none",
			)}
		>
			{children}
		</button>
	);
}

type ClubPaginationProps = {
	page: number;
	pageCount: number;
	onPageChange: (page: number) => void;
};

/** FR-6: « ‹ Page N › », walking the result set rather than the whole directory. */
export function ClubPagination({ page, pageCount, onPageChange }: ClubPaginationProps) {
	const isFirst = page <= 1;
	const isLast = page >= pageCount;

	return (
		<nav aria-label="Club results pages" className="flex items-center justify-center gap-1">
			<PageButton label="First page" disabled={isFirst} onClick={() => onPageChange(1)}>
				<ChevronsLeft className="size-[18px]" />
			</PageButton>
			<PageButton label="Previous page" disabled={isFirst} onClick={() => onPageChange(page - 1)}>
				<ChevronLeft className="size-[18px]" />
			</PageButton>

			<span aria-live="polite" className="px-3 text-[15px] text-[#616567]">
				Page {page}
			</span>

			<PageButton label="Next page" disabled={isLast} onClick={() => onPageChange(page + 1)}>
				<ChevronRight className="size-[18px]" />
			</PageButton>
			<PageButton label="Last page" disabled={isLast} onClick={() => onPageChange(pageCount)}>
				<ChevronsRight className="size-[18px]" />
			</PageButton>
		</nav>
	);
}
