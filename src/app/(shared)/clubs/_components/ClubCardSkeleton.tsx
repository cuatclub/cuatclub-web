/**
 * FR-10: mirrors the real card's silhouette exactly, so nothing shifts when data lands.
 */
export function ClubCardSkeleton() {
	return (
		<div
			aria-hidden
			className="flex animate-pulse flex-col rounded-[16px] border border-[#ececec] bg-white px-5 pt-6 pb-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] motion-reduce:animate-none"
		>
			<div className="flex flex-col items-center">
				<div className="size-24 rounded-full bg-[#f0f0f0]" />
				<div className="mt-4 h-7 w-32 rounded bg-[#f0f0f0]" />
				<div className="mt-3 flex gap-2">
					<div className="h-7 w-24 rounded-full bg-[#f0f0f0]" />
					<div className="h-7 w-20 rounded-full bg-[#f0f0f0]" />
				</div>
				<div className="mt-4 w-full space-y-2">
					<div className="h-4 w-full rounded bg-[#f0f0f0]" />
					<div className="mx-auto h-4 w-3/4 rounded bg-[#f0f0f0]" />
				</div>
			</div>

			<div className="mt-auto pt-6">
				<div className="flex gap-3">
					<div className="h-13 flex-1 rounded-full bg-[#f0f0f0]" />
					<div className="h-13 flex-1 rounded-full bg-[#f0f0f0]" />
				</div>
				<hr className="mt-6 border-stroke" />
				<div className="mt-4 flex justify-center gap-10">
					<div className="space-y-1.5">
						<div className="mx-auto h-5 w-10 rounded bg-[#f0f0f0]" />
						<div className="h-4 w-20 rounded bg-[#f0f0f0]" />
					</div>
					<div className="space-y-1.5">
						<div className="mx-auto h-5 w-8 rounded bg-[#f0f0f0]" />
						<div className="h-4 w-14 rounded bg-[#f0f0f0]" />
					</div>
				</div>
			</div>
		</div>
	);
}
