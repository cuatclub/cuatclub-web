"use client";

import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Footer } from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Navbar";
import { SearchBar } from "@/components/ui/SearchBar";
import { api } from "@/trpc/react";
import ClubCard from "./_components/ClubCard";
import { AdvanceFilter, type FilterSelection } from "./_components/AdvanceFilter";
import { InterestChips } from "./_components/InterestChips";
import { buildInterestThemes, FALLBACK_THEME } from "./_components/interest-theme";
import { ErrorState, LoadingState, OfflineState } from "./_components/PageState";
import { Pagination } from "./_components/Pagination";

const PAGE_SIZE = 8;
const EMPTY_SELECTION: FilterSelection = { facultyIds: [], interestIds: [] };

/** Tracks the browser's connection so a dropped network shows the offline state instead of an error. */
function useOnline() {
	// Starts optimistic: `navigator` is unavailable during SSR and a false negative would flash offline art.
	const [online, setOnline] = useState(true);

	useEffect(() => {
		const update = () => setOnline(navigator.onLine);
		update();
		window.addEventListener("online", update);
		window.addEventListener("offline", update);
		return () => {
			window.removeEventListener("online", update);
			window.removeEventListener("offline", update);
		};
	}, []);

	return online;
}

export default function ClubsPage() {
	const [search, setSearch] = useState("");
	const [selection, setSelection] = useState<FilterSelection>(EMPTY_SELECTION);
	const [filterOpen, setFilterOpen] = useState(false);
	const [page, setPage] = useState(1);
	const online = useOnline();

	const organizationsQuery = api.organization.getAll.useQuery();
	const facultiesQuery = api.faculty.getAll.useQuery();
	const interestsQuery = api.interest.getAll.useQuery();

	const faculties = useMemo(
		() => (facultiesQuery.data ?? []).map((row) => ({ id: row.id, name: row.name })),
		[facultiesQuery.data],
	);

	const interests = useMemo(() => {
		const rows = (interestsQuery.data ?? []).map((row) => ({ id: row.id, name: row.name, icon: row.icon }));
		const themes = buildInterestThemes(rows);
		return rows.map((row) => ({ ...row, theme: themes.get(row.id) ?? FALLBACK_THEME }));
	}, [interestsQuery.data]);

	const themeByInterestId = useMemo(
		() => new Map(interests.map((interest) => [interest.id, interest.theme])),
		[interests],
	);

	const clubs = useMemo(() => {
		// `organization.getAll` returns `facultyId` only, so the faculty name is joined here.
		const facultyNames = new Map(faculties.map((row) => [row.id, row.name]));

		return (organizationsQuery.data ?? [])
			.filter((org) => org.category === "CLUB" && !org.isBanned)
			.map((org) => ({
				id: org.id,
				name: org.name,
				bio: org.bio,
				imageUrl: org.image,
				facultyId: org.facultyId,
				facultyName: org.facultyId ? (facultyNames.get(org.facultyId) ?? null) : null,
				interests: (org.interests ?? []).map((row) => ({
					id: row.interest.id,
					name: row.interest.name,
					theme: themeByInterestId.get(row.interest.id) ?? FALLBACK_THEME,
				})),
			}));
	}, [organizationsQuery.data, faculties, themeByInterestId]);

	const results = useMemo(() => {
		const needle = search.trim().toLowerCase();

		return clubs.filter((club) => {
			if (selection.facultyIds.length > 0) {
				if (!club.facultyId || !selection.facultyIds.includes(club.facultyId)) return false;
			}
			if (selection.interestIds.length > 0) {
				if (!club.interests.some((interest) => selection.interestIds.includes(interest.id))) return false;
			}
			if (!needle) return true;

			return (
				club.name.toLowerCase().includes(needle) ||
				(club.bio ?? "").toLowerCase().includes(needle) ||
				(club.facultyName ?? "").toLowerCase().includes(needle) ||
				club.interests.some((interest) => interest.name.toLowerCase().includes(needle))
			);
		});
	}, [clubs, search, selection]);

	useEffect(() => {
		setPage(1);
	}, [search, selection]);

	const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
	const currentPage = Math.min(page, pageCount);
	const visible = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

	const toggleInterest = (id: string) =>
		setSelection((prev) => ({
			...prev,
			interestIds: prev.interestIds.includes(id)
				? prev.interestIds.filter((item) => item !== id)
				: [...prev.interestIds, id],
		}));

	const activeFilters = selection.facultyIds.length + selection.interestIds.length;
	const isLoading = organizationsQuery.isLoading || facultiesQuery.isLoading || interestsQuery.isLoading;
	// Only the club list is load-bearing: a faculty/interest failure just costs names and chips.
	const failed = organizationsQuery.isError;
	const hasLoaded = organizationsQuery.isSuccess;

	const retry = () => {
		void organizationsQuery.refetch();
		void facultiesQuery.refetch();
		void interestsQuery.refetch();
	};

	const renderResults = () => {
		if (!online) return <OfflineState variant={hasLoaded ? "lost" : "none"} />;
		if (isLoading) return <LoadingState />;
		if (failed) return <ErrorState onRetry={retry} />;

		if (results.length === 0) {
			return (
				<div className="flex w-full flex-col items-center gap-2 py-16 text-center">
					<p className="text-lg font-semibold text-[#393E41]">ไม่พบชมรมที่ตรงกับการค้นหา</p>
					<p className="text-base text-[#A4A6A8]">ลองเปลี่ยนคำค้นหา หรือล้างตัวกรองเพื่อดูชมรมทั้งหมด</p>
				</div>
			);
		}

		return (
			<div className="flex w-full max-w-[1100px] flex-col items-center gap-8">
				<div className="grid w-full grid-cols-1 gap-x-5 gap-y-[18px] sm:grid-cols-2 sm:gap-y-6">
					{visible.map((club) => (
						<ClubCard
							key={club.id}
							id={club.id}
							name={club.name}
							bio={club.bio}
							imageUrl={club.imageUrl}
							facultyName={club.facultyName}
							interests={club.interests}
						/>
					))}
				</div>
				<Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage} />
			</div>
		);
	};

	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />

			<main className="body-section flex-1 items-center gap-10 pb-10 lg:gap-15 mt-5 md:mt-10">
				<section className="flex w-full flex-col items-center gap-7">
					<h1 className="w-full max-w-[700px] text-center text-[33px] leading-[1.2] font-semibold text-[#DE5C8E] lg:text-[40px]">
						ค้นหาชมรมทั่วทั้งจุฬา
					</h1>

					{/* Mobile leads with the interest row and puts search underneath; wider screens flip it. */}
					<div className="flex w-full flex-col items-center gap-6">
						<div className="order-2 flex w-full max-w-[340px] items-center gap-2 sm:order-1 sm:max-w-[700px]">
							<SearchBar
								value={search}
								onChange={(event) => setSearch(event.target.value)}
								placeholder="search"
								aria-label="ค้นหาชมรม"
								containerClassName="min-w-0 flex-1"
								className="rounded-full border-[#C2C3C4] pl-12 text-base placeholder:text-base placeholder:text-[#7A7E80]"
							/>
							<button
								type="button"
								onClick={() => setFilterOpen(true)}
								aria-label="ตัวกรองขั้นสูง"
								className="relative grid h-12 w-12 shrink-0 cursor-pointer place-items-center rounded-xl border border-[#C2C3C4] bg-white text-[#393E41] transition-colors hover:border-[#DE5C8E] hover:text-[#DE5C8E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DE5C8E]"
							>
								<SlidersHorizontal className="size-6" strokeWidth={1.5} aria-hidden />
								{activeFilters > 0 && (
									<span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-[#DE5C8E] text-[11px] font-semibold text-white">
										{activeFilters}
									</span>
								)}
							</button>
						</div>

						{interests.length > 0 && (
							/* Wider than the search bar so a single row of interests keeps its labels unwrapped. */
							<div className="order-1 w-full max-w-[700px] sm:order-2 md:max-w-[860px]">
								<InterestChips
									interests={interests}
									selectedIds={selection.interestIds}
									onToggle={toggleInterest}
								/>
							</div>
						)}
					</div>
				</section>

				{renderResults()}
			</main>

			<Footer />

			<AdvanceFilter
				open={filterOpen}
				onClose={() => setFilterOpen(false)}
				faculties={faculties}
				interests={interests}
				selection={selection}
				onApply={setSelection}
			/>
		</div>
	);
}
