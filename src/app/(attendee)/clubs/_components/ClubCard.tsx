"use client";

import { Check, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface Category {
	name: string;
	color: string;
}

export interface ClubCardProps {
	id: string;
	name: string;
	description: string;
	tag: string;
	imageUrl: string;
	categories: Category[];
	followed: boolean;
	followBusy?: boolean;
	onToggleFollow: () => void;
}

const ClubCard = (props: ClubCardProps) => {
	const { id, name, description, tag, imageUrl, categories, followed, followBusy, onToggleFollow } = props;
	const href = `/clubs/${id}`;

	const followButtonClass = cn(
		"inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap cursor-pointer px-3 py-1.5 rounded-full border-2 transition-all disabled:opacity-60",
		followed
			? "border-primary bg-primary text-white hover:bg-[#c94d7d] hover:border-[#c94d7d]"
			: "border-primary bg-white text-primary hover:bg-primary hover:text-white",
	);

	return (
		<div className="w-full flex flex-col px-3 py-5 sm:p-4 gap-3 sm:gap-4 bg-white border border-stroke rounded-[12px]">
			<div className="w-full flex items-center justify-between gap-2">
				<Link href={href} className="flex gap-2 sm:gap-3 items-center min-w-0 flex-1 hover:text-primary">
					{imageUrl ? (
						<Image
							width={48}
							height={48}
							alt={name}
							src={imageUrl}
							className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover object-center shrink-0"
						/>
					) : (
						<div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-200 shrink-0" />
					)}
					<div className="flex flex-col min-w-0">
						<p className="font-semibold truncate">{name}</p>
						<p className="text-text-gray text-[10px] sm:text-sm truncate">{tag || "—"}</p>
					</div>
				</Link>

				<button
					type="button"
					disabled={followBusy}
					onClick={onToggleFollow}
					className={cn("hidden lg:inline-flex", followButtonClass)}
				>
					<span>{followed ? "ติดตามแล้ว" : "ติดตาม"}</span>
					{followed ? <Check size={16} className="shrink-0" /> : <Plus size={16} className="shrink-0" />}
				</button>
			</div>

			<Link href={href} className="text-text-gray text-[10px] sm:text-sm w-full line-clamp-2 hover:text-primary">
				{description || "ไม่มีคำอธิบาย"}
			</Link>

			<div className="flex gap-1 sm:gap-2 w-full flex-wrap items-center min-h-[24px]">
				{categories.map((category, idx) => (
					<div
						key={`${category.name}-${idx}`}
						className="font-semibold text-[8px] sm:text-xs rounded-[4px] text-white px-2 sm:px-3 py-1"
						style={{ backgroundColor: category.color }}
					>
						{category.name}
					</div>
				))}
			</div>

			<Link href={href} className="text-center text-xs font-semibold text-primary hover:underline sm:text-sm">
				ดูรายละเอียดชมรม
			</Link>

			<button
				type="button"
				disabled={followBusy}
				onClick={onToggleFollow}
				className={cn("w-full justify-center lg:hidden text-sm sm:text-base", followButtonClass)}
			>
				<span>{followed ? "ติดตามแล้ว" : "ติดตาม"}</span>
				{followed ? <Check size={16} className="shrink-0" /> : <Plus size={16} className="shrink-0" />}
			</button>
		</div>
	);
};

export default ClubCard;
