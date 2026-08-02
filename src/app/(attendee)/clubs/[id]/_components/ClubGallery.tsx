"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GalleryModal } from "./GalleryModal";

interface ClubGalleryProps {
	clubName: string;
	gallery?: any[] | null;
}

export function ClubGallery({ clubName, gallery }: ClubGalleryProps) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);

	if (!gallery || gallery.length === 0) {
		return null;
	}

	const scroll = (direction: "left" | "right") => {
		if (scrollRef.current) {
			const firstChild = scrollRef.current.firstElementChild as HTMLElement;
			if (firstChild) {
				// Calculate scroll distance: (Item Width + Gap) * 2
				const scrollAmount = (firstChild.offsetWidth + 16) * 2;
				
				scrollRef.current.scrollBy({
					left: direction === "left" ? -scrollAmount : scrollAmount,
					behavior: "smooth",
				});
			}
		}
	};

	return (
		<section className="space-y-4 pt-2 sm:space-y-6">
			<h2 className="text-xl font-bold text-foreground sm:text-2xl">What its like to be with us</h2>
			
			<div className="group relative">
				{/* Left Navigation Arrow - Only show if more than 3 images */}
				{gallery.length > 3 && (
					<button 
						onClick={() => scroll("left")}
						className="absolute -left-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-stroke bg-white/90 text-foreground shadow-md backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg sm:group-hover:flex"
						aria-label="Scroll left"
					>
						<ChevronLeft className="h-6 w-6" />
					</button>
				)}

				{/* Horizontally Scrollable Gallery */}
				<div 
					ref={scrollRef}
					className="no-scrollbar flex snap-x snap-mandatory flex-nowrap gap-3 overflow-x-auto pb-4 scroll-smooth sm:gap-4"
				>
					{gallery.map((img: string, idx: number) => (
						<div 
							key={idx} 
							onClick={() => setSelectedImage(img)}
							className="group/item relative aspect-[4/3] w-64 shrink-0 snap-center overflow-hidden rounded-xl bg-muted shadow-sm cursor-pointer sm:w-[280px] md:w-[320px] sm:rounded-[24px]"
							title={`Click to expand ${clubName} gallery image ${idx + 1}`}
						>
							<Image
								src={img}
								alt={`${clubName} gallery image ${idx + 1}`}
								fill
								className="object-cover transition-transform duration-500 group-hover/item:scale-105"
							/>
						</div>
					))}
				</div>

				{/* Right Navigation Arrow - Only show if more than 3 images */}
				{gallery.length > 3 && (
					<button 
						onClick={() => scroll("right")}
						className="absolute -right-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-stroke bg-white/90 text-foreground shadow-md backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg sm:group-hover:flex"
						aria-label="Scroll right"
					>
						<ChevronRight className="h-6 w-6" />
					</button>
				)}
			</div>

			{/* Render our new isolated modal component */}
			<GalleryModal 
				imageUrl={selectedImage} 
				onClose={() => setSelectedImage(null)} 
			/>
		</section>
	);
}