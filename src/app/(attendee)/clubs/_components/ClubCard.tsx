"use client";

import { ArrowRight, Building2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { InterestTheme } from "./interest-theme";

export interface ClubCardInterest {
	id: string;
	name: string;
	theme: InterestTheme;
}

export interface ClubCardProps {
	id: string;
	name: string;
	bio?: string | null;
	imageUrl?: string | null;
	facultyName?: string | null;
	interests: ClubCardInterest[];
}

/** Figma caps the tag row at two pills so the header stays on one line. */
const MAX_TAGS = 2;

const ClubCard = ({ id, name, bio, imageUrl, facultyName, interests }: ClubCardProps) => (
	<Link
		href={`/clubs/${id}`}
		className="group flex h-full rounded-[12px] border border-[#EBECEC] bg-white p-5 shadow-[0_0_12.5px_rgba(0,0,0,0.1)] transition-shadow hover:shadow-[0_0_18px_rgba(222,92,142,0.18)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DE5C8E] lg:p-6"
	>
		<div className="flex min-w-0 flex-1 flex-col gap-3.5">
			<div className="flex flex-col gap-4">
				<div className="flex items-start justify-between gap-2">
					<Image
						src={imageUrl?.trim() ? imageUrl : "/images/Profile.svg"}
						alt=""
						width={56}
						height={56}
						className="size-14 shrink-0 rounded-full object-cover object-center"
					/>
					{interests.length > 0 && (
						<ul className="flex flex-wrap items-center justify-end gap-1.5">
							{interests.slice(0, MAX_TAGS).map((interest) => (
								<li
									key={interest.id}
									className="rounded-full px-3 py-1.5 text-[13px] font-medium whitespace-nowrap lg:text-sm"
									style={{ backgroundColor: interest.theme.soft, color: interest.theme.ink }}
								>
									{interest.name}
								</li>
							))}
						</ul>
					)}
				</div>

				<div className="flex flex-col gap-4 border-b border-[#EBECEC] pb-5">
					<p className="truncate text-xl font-bold text-[#181A1B]">{name}</p>
					<p className="line-clamp-2 min-h-[3em] text-sm leading-[1.5] text-[#7A7E80] lg:text-base">
						{bio?.trim() ? bio : "ชมรมนี้ยังไม่ได้เพิ่มคำอธิบาย"}
					</p>
					<div className="flex min-w-0 items-center gap-2 text-sm text-[#7A7E80]">
						<Building2 className="size-6 shrink-0" strokeWidth={1.5} aria-hidden />
						<span className="truncate">{facultyName?.trim() ? facultyName : "ไม่ระบุคณะ"}</span>
					</div>
				</div>
			</div>

			<div className="mt-auto flex items-center justify-between">
				<span className="text-base font-semibold text-[#DE5C8E] lg:text-[19px]">ดูชมรม</span>
				<ArrowRight
					className="size-[34px] text-[#DE5C8E] transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
					strokeWidth={1.5}
					aria-hidden
				/>
			</div>
		</div>
	</Link>
);

export default ClubCard;
