import Image from "next/image";

/**
 * FR-10. Serves both an empty search and an empty directory — the subline covers each.
 * The grid and pagination are gone; the H1, search field and filter button stay put.
 */
export function ClubsEmptyState() {
	return (
		<div className="flex flex-col items-center justify-center px-4 py-24 text-center sm:py-32">
			<Image
				src="/images/svg/no-clubs-found.svg"
				alt=""
				width={304}
				height={178}
				priority
				className="h-auto w-[228px] sm:w-[304px]"
			/>
			<h2 className="mt-8 text-[22px] font-semibold text-primary">No clubs found</h2>
			<p className="mt-2 max-w-[320px] text-[15px] leading-6 text-text-light-gray">
				Try a different search or check back as more clubs join CUATCLUB.
			</p>
		</div>
	);
}
