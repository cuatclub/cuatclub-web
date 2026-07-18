"use client";

import { Check, Plus } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface Category {
	name: string;
	color: string;
}

export interface ClubCardProps {
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
	const { name, description, tag, imageUrl, categories, followed, followBusy, onToggleFollow } = props;

	const followButtonClass = cn(
		"items-center gap-1 cursor-pointer px-2.5 py-1.5 rounded-full border-2 transition-all disabled:opacity-60",
		followed
			? "border-primary bg-primary text-white hover:bg-[#c94d7d] hover:border-[#c94d7d]"
			: "border-primary bg-white text-primary hover:bg-primary hover:text-white",
	);

	return (
		<div className="w-full flex flex-col px-3 py-5 sm:p-4 gap-3 sm:gap-4 bg-white border border-stroke rounded-[12px]">
			<div className="w-full flex items-center justify-between gap-2">
				<div className="flex gap-2 sm:gap-3 items-center w-full min-w-0">
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
				</div>

				<button
					type="button"
					disabled={followBusy}
					onClick={onToggleFollow}
					className={cn("hidden lg:flex", followButtonClass)}
				>
					<p>{followed ? "ติดตามแล้ว" : "ติดตาม"}</p>
					{followed ? <Check size={16} /> : <Plus size={16} />}
				</button>
			</div>

			<p className="text-text-gray text-[10px] sm:text-sm w-full line-clamp-2">
				{description || "ไม่มีคำอธิบาย"}
			</p>

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

			<button
				type="button"
				disabled={followBusy}
				onClick={onToggleFollow}
				className={cn("flex justify-center lg:hidden", followButtonClass)}
			>
				<p className="text-sm sm:text-base">{followed ? "ติดตามแล้ว" : "ติดตาม"}</p>
				{followed ? <Check size={16} /> : <Plus size={16} />}
			</button>
		</div>
	);
};

export default ClubCard;
