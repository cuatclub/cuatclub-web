"use client";

import { useEffect } from "react";
import { Footer } from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Navbar";
import { ErrorState } from "./_components/PageState";

export default function ClubsError({ error, reset }: { error: Error; reset: () => void }) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			<main className="body-section flex-1 items-center justify-center">
				<ErrorState onRetry={reset} />
			</main>
			<Footer />
		</div>
	);
}
