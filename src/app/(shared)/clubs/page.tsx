import { Suspense } from "react";
import type { Metadata } from "next";
import { Footer } from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Navbar";
import { ClubDiscovery } from "./_components/ClubDiscovery";

export const metadata: Metadata = {
	title: "Discover Clubs at Chula | CUAT Club",
	description: "Browse every club at Chulalongkorn University, and follow the ones you like.",
};

/** Public (FR-1): a logged-out visitor sees the full grid, with no redirect. */
export default function ClubsPage() {
	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			{/* Only the body takes the grey ground; the navbar and footer stay white, as drawn. */}
			<main className="flex-1 bg-[#f8f8f8]">
				{/* The grid reads its state from the URL, so it needs a Suspense boundary to prerender. */}
				<Suspense>
					<ClubDiscovery />
				</Suspense>
			</main>
			<Footer />
		</div>
	);
}
