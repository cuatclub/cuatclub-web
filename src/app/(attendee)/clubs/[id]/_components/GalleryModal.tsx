"use client";

import Image from "next/image";
import { X } from "lucide-react";

interface GalleryModalProps {
	imageUrl: string | null;
	onClose: () => void;
}

export function GalleryModal({ imageUrl, onClose }: GalleryModalProps) {
	if (!imageUrl) return null;

	return (
		<div 
			className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm transition-opacity"
			onClick={onClose} 
		>
			<button 
				className="absolute right-4 top-6 z-[10000] flex items-center gap-2 rounded-full bg-white/20 px-2 py-2 text-white backdrop-blur-md transition-colors hover:bg-white/30 sm:right-8 sm:top-8 hover:cursor-pointer"
				onClick={onClose}
				aria-label="Close modal"
			>
				<X className="h-6 w-6" />
			</button>
			
			<div 
				className="relative h-[80vh] w-[90vw] sm:h-[90vh] sm:w-[95vw]"
				onClick={(e) => e.stopPropagation()} 
			>
				<Image
					src={imageUrl}
					alt="Expanded gallery image"
					fill
					className="object-contain"
					priority 
				/>
			</div>
		</div>
	);
}