"use client";

import { themeColor } from "@/app/(organization)/posts/_components/PostCard";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type FeedEvent = {
	id: string;
	organizationId: string;
	title: string;
	image: string;
	description?: string | null;
	activityTypeName?: string | null;
	instaLink?: string | null;
	date: Date | string;
	organizationName: string;
	organizationImage?: string | null;
};

type FeedTag = {
	interestId: string;
	name: string;
};

export const FeedCard = ({ event, tags }: { event: FeedEvent; tags: FeedTag[] }) => {
	const router = useRouter();
	const date = new Date(event.date);
	const closeDate = Intl.DateTimeFormat("th-TH", {
		day: "numeric",
		month: "long",
		year: "numeric",
	}).format(date);

	return (
		<div
			className="border-1 border-stroke rounded-[12px] py-[10px] px-[10px] lg:py-5 lg:px-6 h-[358px] sm:h-[213px] lg:h-[266px] flex sm:flex-row flex-col justify-center sm:gap-x-5 gap-y-[10px] hover:cursor-pointer hover:bg-calendar-item-hover duration-150"
			onClick={() => {
				router.push(`/posts/${event.id}`);
			}}
		>
			<div className="relative h-[191px] w-full sm:h-[190px] lg:h-[226px] sm:w-42.5 rounded-[12px] bg-primary shrink-0 overflow-hidden">
				{event.image ? (
					<Image
						className="h-full w-full object-cover rounded-[12px]"
						src={event.image}
						alt={event.title}
						fill
						sizes="(max-width: 640px) 190px, (max-width: 1024px) 226px, 226px"
						quality={90}
					/>
				) : (
					<div className="h-full w-full bg-gray-200" />
				)}
			</div>
			<div className="min-w-0 h-[150px] sm:h-[193px] lg:h-[226px] flex-1 flex flex-col justify-between">
				<div className="flex flex-col gap-y-[5px]">
					<Link
						href={`/clubs/${event.organizationId}`}
						onClick={(e) => e.stopPropagation()}
						className="flex w-fit items-center gap-2 hover:text-primary"
					>
						{event.organizationImage ? (
							<Image
								src={event.organizationImage}
								alt={event.organizationName}
								width={24}
								height={24}
								className="h-6 w-6 rounded-full object-cover object-center"
							/>
						) : (
							<div className="h-6 w-6 rounded-full bg-gray-200" />
						)}
						<span className="text-xs sm:text-sm text-text-gray line-clamp-1">{event.organizationName}</span>
					</Link>
					<div className="flex flex-col sm:flex-row sm:items-center sm:gap-x-4">
						<div className="font-semibold lg:text-xl sm:text-lg text-xs line-clamp-1 sm:line-clamp-2">
							{event.title}
						</div>
						{event.activityTypeName && (
							<div className="items-center text-primary gap-x-2 flex">
								<div className="w-1.5 h-1.5 rounded-full bg-primary" />
								<div className="font-semibold text-xs sm:text-sm lg:text-base">
									{event.activityTypeName}
								</div>
							</div>
						)}
					</div>
					<div className="flex gap-x-2 gap-y-0.75 text-[0.75rem] h-[22px] sm:h-[26px] items-center text-white flex-wrap overflow-hidden">
						{tags.map((tag, idx) => {
							return (
								<div
									key={`${tag.interestId}-${idx}`}
									className="text-[8px] sm:text-xs px-2 sm:px-2.5 py-1 rounded-[6px] shrink-0"
									style={{ backgroundColor: themeColor[idx % themeColor.length] }}
								>
									{tag.name}
								</div>
							);
						})}
					</div>
					<p className="hidden sm:block w-full mt-1 text-text-gray line-clamp-2 lg:line-clamp-3 text-[10px] sm:text-sm lg:text-base font-light tracking-tight">
						{event.description}
					</p>
				</div>
				<div className="flex-col lg:flex-row flex justify-between lg:text-base sm:text-[13px] text-[8px]">
					<div className="hidden sm:flex justify-between">
						<div className="flex gap-1 min-w-0">
							<span className="font-semibold shrink-0">ฟอร์มรับสมัคร : </span>
							{event.instaLink ? (
								<Link
									href={event.instaLink}
									target="_blank"
									className="text-text-gray truncate hover:underline"
									onClick={(e) => e.stopPropagation()}
								>
									{event.instaLink}
								</Link>
							) : (
								<span className="text-text-gray">-</span>
							)}
						</div>
					</div>
					<div className="flex justify-between">
						<div className="flex gap-1 truncate">
							<span className="font-semibold shrink-0">ปิดรับสมัคร : </span>
							<span className="text-text-gray truncate">{closeDate}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
