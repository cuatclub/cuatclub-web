import { Footer } from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Navbar";
import { NotFoundState } from "./_components/PageState";

export default function ClubsNotFound() {
	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			<main className="body-section flex-1 items-center justify-center">
				<NotFoundState />
			</main>
			<Footer />
		</div>
	);
}
