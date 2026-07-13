"use client";

import Image from "next/image";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RouterOutputs } from "@/trpc/react";

export type Club = RouterOutputs["organization"]["discover"]["items"][number];

/** FR-2: 1,234 followers reads as "1.2k". */
function formatCount(value: number): string {
	if (value < 1000) return String(value);
	const thousands = value / 1000;
	return `${thousands >= 10 ? Math.round(thousands) : Number(thousands.toFixed(1))}k`;
}

/** next/image throws on hosts that aren't allow-listed; anything else falls back to the avatar. */
function usableImage(image: string | null): string | null {
	if (!image) return null;
	const src = image.trim();
	return src.startsWith("http") || src.startsWith("/") ? src : null;
}

/**
 * FR-2: categories first, then faculty, capped at three. A club with more than two
 * categories gets a `+N` so the row never grows past what the card can hold.
 */
function buildTags(club: Club): string[] {
	const tags = club.interests.slice(0, 2).map((interest) => interest.name);
	if (club.faculty) tags.push(club.faculty.name);
	const overflow = club.interests.length - 2;
	if (overflow > 0) tags.push(`+${overflow}`);
	return tags;
}

type ClubCardProps = {
	club: Club;
	isFollowPending: boolean;
	onToggleFollow: (club: Club) => void;
};

export function ClubCard({ club, isFollowPending, onToggleFollow }: ClubCardProps) {
	const logo = usableImage(club.image);
	const tags = buildTags(club);

	return (
		// Hover and keyboard focus get the same pink edge (FR-2, FR-12). Only the border colour and
		// shadow change — a width change here would nudge the card's contents under the cursor.
		<article
			className={cn(
				"flex flex-col rounded-[16px] border border-[#ececec] bg-white px-5 pt-6 pb-6",
				"shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-[border-color,box-shadow] duration-200",
				"hover:border-primary hover:shadow-[0_2px_14px_rgba(223,92,142,0.22)]",
				"has-[:focus-visible]:border-primary has-[:focus-visible]:shadow-[0_2px_14px_rgba(223,92,142,0.22)]",
				"motion-reduce:transition-none",
			)}
		>
			<div className="flex flex-col items-center text-center">
				{logo ? (
					<Image
						src={logo}
						alt=""
						width={96}
						height={96}
						className="size-24 shrink-0 rounded-full border-2 border-primary/50 object-cover"
					/>
				) : (
					<div
						aria-hidden
						className="flex size-24 shrink-0 items-center justify-center rounded-full border-2 border-primary/50 bg-[#fff2f6]"
					>
						<Users className="size-10 text-primary/70" />
					</div>
				)}

				<h2 className="mt-4 w-full truncate text-xl font-semibold text-[#393e41]">{club.name}</h2>

				{tags.length > 0 && (
					<ul className="mt-3 flex flex-wrap items-center justify-center gap-2">
						{tags.map((tag, index) => (
							<li
								// Index, not the label: a faculty and a category could share a name.
								key={index}
								className="rounded-full border border-primary px-3.5 py-1 text-[13px] leading-5 text-primary"
							>
								{tag}
							</li>
						))}
					</ul>
				)}

				{club.bio && (
					<p className="mt-4 line-clamp-2 text-sm leading-6 text-text-gray">{club.bio}</p>
				)}
			</div>

			{/* Pinned to the bottom so the divider and stats line up across a row of ragged bios. */}
			<div className="mt-auto pt-6">
				<div className="flex items-stretch gap-3">
					<button
						type="button"
						aria-pressed={club.isFollowing}
						aria-label={
							club.isFollowing ? `Unfollow ${club.name}` : `Follow ${club.name}`
						}
						disabled={isFollowPending}
						onClick={() => onToggleFollow(club)}
						className={cn(
							"h-13 flex-1 cursor-pointer rounded-full text-[15px] font-semibold transition-colors",
							"focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none",
							"disabled:cursor-not-allowed disabled:opacity-60",
							"motion-reduce:transition-none",
							club.isFollowing
								? "border-2 border-primary bg-white text-primary hover:bg-[#fff2f6]"
								: "bg-primary text-white hover:bg-accent",
						)}
					>
						{/* Label is fixed: a button that resizes on hover shifts the card under the cursor. */}
						{club.isFollowing ? "Followed" : "Follow Club"}
					</button>

					{/*
					 * FR-8: See More renders exactly as drawn and does nothing — /clubs/[id] does not
					 * exist yet. A span, not a button, so keyboard users never land on a control that
					 * swallows Enter, and screen readers are not offered a dead action.
					 */}
					<span
						aria-hidden="true"
						className="flex h-13 flex-1 cursor-default items-center justify-center rounded-full border-2 border-primary bg-white text-[15px] font-semibold text-primary select-none"
					>
						See More
					</span>
				</div>

				<hr className="mt-6 border-stroke" />

				{/* `dt` precedes `dd` as the spec requires; the column is reversed so the number still
				    sits above its label. */}
				<dl className="mt-4 flex justify-center gap-10 text-center">
					<div className="flex flex-col-reverse">
						<dt className="text-[15px] text-[#616567]">Followers</dt>
						<dd className="text-[17px] font-semibold text-[#616567]">
							{formatCount(club.followerCount)}
						</dd>
					</div>
					<div className="flex flex-col-reverse">
						<dt className="text-[15px] text-[#616567]">Events</dt>
						<dd className="text-[17px] font-semibold text-[#616567]">
							{formatCount(club.eventCount)}
						</dd>
					</div>
				</dl>
			</div>
		</article>
	);
}
