"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
	page: number;
	pageCount: number;
	onPageChange: (page: number) => void;
}

const stepClass = (disabled: boolean) =>
	cn(
		"grid size-6 cursor-pointer place-items-center rounded-sm text-[#393E41] transition-colors",
		"hover:text-[#DE5C8E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DE5C8E]",
		disabled && "cursor-default text-[#C2C3C4] hover:text-[#C2C3C4]",
	);

export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
	const atStart = page <= 1;
	const atEnd = page >= pageCount;

	return (
		<nav aria-label="Club pages" className="flex w-40 items-center justify-center gap-2.5">
			<div className="flex items-center">
				<button
					type="button"
					aria-label="First page"
					disabled={atStart}
					onClick={() => onPageChange(1)}
					className={stepClass(atStart)}
				>
					<ChevronsLeft className="size-6" strokeWidth={1.5} aria-hidden />
				</button>
				<button
					type="button"
					aria-label="Previous page"
					disabled={atStart}
					onClick={() => onPageChange(page - 1)}
					className={stepClass(atStart)}
				>
					<ChevronLeft className="size-6" strokeWidth={1.5} aria-hidden />
				</button>
			</div>

			<p aria-live="polite" className="text-center text-base whitespace-nowrap text-[#393E41]">
				Page {page}
			</p>

			<div className="flex items-center">
				<button
					type="button"
					aria-label="Next page"
					disabled={atEnd}
					onClick={() => onPageChange(page + 1)}
					className={stepClass(atEnd)}
				>
					<ChevronRight className="size-6" strokeWidth={1.5} aria-hidden />
				</button>
				<button
					type="button"
					aria-label="Last page"
					disabled={atEnd}
					onClick={() => onPageChange(pageCount)}
					className={stepClass(atEnd)}
				>
					<ChevronsRight className="size-6" strokeWidth={1.5} aria-hidden />
				</button>
			</div>
		</nav>
	);
}
