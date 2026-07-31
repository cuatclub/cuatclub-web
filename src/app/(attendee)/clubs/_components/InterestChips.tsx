"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { interestIcon, type InterestTheme } from "./interest-theme";

export interface ChipInterest {
	id: string;
	name: string;
	icon: string;
	theme: InterestTheme;
}

interface InterestChipsProps {
	interests: ChipInterest[];
	selectedIds: string[];
	onToggle: (id: string) => void;
}

/**
 * The quick-pick row above the grid — one circular swatch per interest.
 * Tablet and desktop lay every interest out on a single row; below `md` they wrap 3 per row.
 */
export function InterestChips({ interests, selectedIds, onToggle }: InterestChipsProps) {
	return (
		<ul
			className="grid w-full grid-cols-3 justify-items-center gap-x-2 gap-y-4 md:[grid-template-columns:repeat(var(--chip-cols),minmax(0,1fr))]"
			style={{ "--chip-cols": interests.length } as CSSProperties}
		>
			{interests.map((interest) => {
				const Icon = interestIcon(interest.icon);
				const selected = selectedIds.includes(interest.id);

				return (
					<li key={interest.id} className="w-full">
						<button
							type="button"
							aria-pressed={selected}
							onClick={() => onToggle(interest.id)}
							className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DE5C8E]"
						>
							<span
								className={cn(
									"grid size-[50px] shrink-0 place-items-center rounded-full transition-[box-shadow,transform] duration-200",
									"motion-safe:hover:-translate-y-0.5",
									selected && "ring-2 ring-[#DE5C8E] ring-offset-2",
								)}
								style={{ backgroundColor: interest.theme.soft }}
							>
								<Icon
									className="size-[25px]"
									style={{ color: interest.theme.ink }}
									strokeWidth={1.75}
									aria-hidden
								/>
							</span>
							<span
								className={cn(
									"text-center text-[13px] leading-[1.2] text-balance text-[#393E41] lg:text-sm",
									selected && "font-medium text-[#DE5C8E]",
								)}
							>
								{interest.name}
							</span>
						</button>
					</li>
				);
			})}
		</ul>
	);
}
