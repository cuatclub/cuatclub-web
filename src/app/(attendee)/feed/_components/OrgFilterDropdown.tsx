"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type OrgFilterDropdownProps = {
	options: string[];
	value: string[];
	onChange: (next: string[]) => void;
	className?: string;
	placeholder?: string;
};

export function OrgFilterDropdown({
	options,
	value,
	onChange,
	className,
	placeholder = "ชมรม/องค์กร",
}: OrgFilterDropdownProps) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return options;
		return options.filter((name) => name.toLowerCase().includes(q));
	}, [options, query]);

	const selectedSet = useMemo(() => new Set(value), [value]);

	const summary =
		value.length === 0
			? placeholder
			: value.length === 1
				? value[0]
				: `เลือก ${value.length} องค์กร`;

	const toggle = (name: string) => {
		if (selectedSet.has(name)) {
			onChange(value.filter((item) => item !== name));
		} else {
			onChange([...value, name]);
		}
	};

	return (
		<DropdownMenu
			modal={false}
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (!next) setQuery("");
			}}
		>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"w-[200px] sm:w-[220px] shrink-0 justify-between gap-2 font-normal text-left hover:bg-background",
						className,
					)}
				>
					<span className="min-w-0 flex-1 truncate text-left">{summary}</span>
					<ChevronDown className="size-4 shrink-0 opacity-60" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-[min(280px,calc(100vw-32px))] p-2"
				onCloseAutoFocus={(e) => e.preventDefault()}
			>
				<div className="relative mb-2">
					<Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#949ba3]" />
					<Input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="ค้นหาชมรม/องค์กร"
						className="h-9 rounded-lg border-[#d9dce0] pl-8 text-sm shadow-none"
						onKeyDown={(e) => e.stopPropagation()}
					/>
				</div>
				<div className="max-h-56 overflow-y-auto">
					{filtered.length === 0 ? (
						<p className="px-2 py-3 text-center text-sm text-[#949ba3]">ไม่พบองค์กร</p>
					) : (
						filtered.map((name) => {
							const checked = selectedSet.has(name);
							return (
								<button
									type="button"
									key={name}
									onClick={() => toggle(name)}
									className={cn(
										"flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-[#fff1f6]",
										checked && "bg-[#fff1f6] text-primary",
									)}
								>
									<span
										className={cn(
											"flex h-4 w-4 shrink-0 items-center justify-center rounded border",
											checked ? "border-primary bg-primary text-white" : "border-[#cfd3d8]",
										)}
									>
										{checked && <Check className="h-3 w-3" />}
									</span>
									<span className="min-w-0 truncate">{name}</span>
								</button>
							);
						})
					)}
				</div>
				{value.length > 0 && (
					<button
						type="button"
						className="mt-2 w-full rounded-md px-2 py-1.5 text-left text-xs font-medium text-[#777e86] hover:bg-[#f6f7f8] hover:text-[#34383d]"
						onClick={() => onChange([])}
					>
						ล้างตัวกรอง
					</button>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
