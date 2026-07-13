"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type ToastProps = {
	message: string;
	onDismiss: () => void;
};

/** Small enough to live here: the app ships no toast library, and this is the only surface using one. */
export function Toast({ message, onDismiss }: ToastProps) {
	useEffect(() => {
		const timer = setTimeout(onDismiss, 5000);
		return () => clearTimeout(timer);
	}, [onDismiss]);

	return (
		<div
			role="status"
			className="fixed bottom-6 left-1/2 z-10000 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-full border border-[#ececec] bg-white py-3 pr-3 pl-5 shadow-[0_4px_16px_rgba(0,0,0,0.14)]"
		>
			<span className="text-sm text-[#393e41]">{message}</span>
			<button
				type="button"
				aria-label="Dismiss"
				onClick={onDismiss}
				className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-text-gray transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none motion-reduce:transition-none"
			>
				<X className="size-4" />
			</button>
		</div>
	);
}
