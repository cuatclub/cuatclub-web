"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Full-width states that stand in for the club grid: loading, error, 404 and offline.
 * All four share the Figma layout — artwork, pink H4 title, grey supporting line.
 */
function StateShell({ children }: { children: ReactNode }) {
	return (
		<div className="flex w-full flex-1 flex-col items-center justify-center gap-7 py-16 text-center sm:py-24">
			{children}
		</div>
	);
}

function StateCopy({ title, description }: { title: string; description: string }) {
	return (
		<div className="flex max-w-[337px] flex-col gap-4">
			<h2 className="text-lg font-semibold text-[#DE5C8E] sm:text-[23px]">{title}</h2>
			<p className="text-sm leading-[1.3] text-[#A4A6A8] sm:text-base">{description}</p>
		</div>
	);
}

function Artwork({ src, width, height }: { src: string; width: number; height: number }) {
	return (
		<Image
			src={src}
			alt=""
			width={width}
			height={height}
			className="h-auto w-full max-w-[240px] sm:max-w-[300px] lg:max-w-[337px]"
			priority
		/>
	);
}

export function LoadingState() {
	return (
		<StateShell>
			<div role="status" className="flex flex-col items-center gap-7">
				<svg
					viewBox="0 0 48 48"
					className="size-20 animate-spin sm:size-[120px] motion-reduce:animate-none"
					aria-hidden
				>
					<circle cx="24" cy="24" r="20" fill="none" stroke="#FCEFF4" strokeWidth="4" />
					<circle
						cx="24"
						cy="24"
						r="20"
						fill="none"
						stroke="#DE5C8E"
						strokeWidth="4"
						strokeLinecap="round"
						strokeDasharray="125.66"
						strokeDashoffset="94"
					/>
				</svg>
				<p className="text-lg font-semibold text-[#393E41] sm:text-[23px]">Just a moment...</p>
			</div>
		</StateShell>
	);
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
	return (
		<StateShell>
			<Artwork src="/images/svg/error-state.svg" width={338} height={225} />
			<StateCopy
				title="Something went wrong"
				description="We ran into an unexpected issue. Please try again or come back shortly."
			/>
			{onRetry && (
				<button
					type="button"
					onClick={onRetry}
					className="cursor-pointer rounded-full bg-[#DE5C8E] px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#c94d7d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DE5C8E] sm:text-[19px]"
				>
					Try again
				</button>
			)}
		</StateShell>
	);
}

export function NotFoundState() {
	return (
		<StateShell>
			<Artwork src="/images/svg/page-not-found.svg" width={315} height={177} />
			<StateCopy
				title="This page doesn't exist"
				description="The link may be outdated or the page may have moved."
			/>
			<Link
				href="/clubs"
				className="rounded-full bg-[#DE5C8E] px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#c94d7d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DE5C8E] sm:text-[19px]"
			>
				Back to clubs
			</Link>
		</StateShell>
	);
}

/**
 * `lost` is for a connection that dropped while the page was open; `none` is for a page
 * that never reached the network. Figma ships both wordings on the same artwork.
 */
export function OfflineState({ variant = "none" }: { variant?: "none" | "lost" }) {
	return (
		<StateShell>
			<Artwork src="/images/svg/no-connection.svg" width={338} height={225} />
			{variant === "lost" ? (
				<StateCopy
					title="You're offline"
					description="It looks like you've lost connection. We'll reconnect automatically once you're back."
				/>
			) : (
				<StateCopy
					title="No internet connection"
					description="Check your connection and try again when you're back online."
				/>
			)}
		</StateShell>
	);
}
