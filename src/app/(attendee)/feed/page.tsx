"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FeedCard } from "./_components/FeedCard";
import { Dropdown } from "@/components/ui/Dropdown";
import { Footer } from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Navbar";
import { SearchBar } from "@/components/ui/SearchBar";
import { api } from "@/trpc/react";

const SORT_OPTIONS = ["ใหม่ไปเก่า", "เก่าไปใหม่", "ไล่ตามเดดไลน์"] as const;

export default function FeedPage() {
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [choice, setChoice] = useState<string>("");
	const [sortOpen, setSortOpen] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(search.trim()), 250);
		return () => clearTimeout(timer);
	}, [search]);

	const createdByAsc = choice === "เก่าไปใหม่";
	const useSearch = debouncedSearch.length > 0;

	const allQuery = api.post.getByFilter.useQuery({}, { enabled: !useSearch });
	const searchQuery = api.post.getBySearch.useQuery(
		{ searchQuery: debouncedSearch, createdByAsc },
		{ enabled: useSearch },
	);

	const isLoading = useSearch ? searchQuery.isLoading : allQuery.isLoading;
	const rawPosts = useSearch ? (searchQuery.data ?? []) : (allQuery.data ?? []);

	const posts = useMemo(() => {
		const list = [...rawPosts];
		if (choice === "ใหม่ไปเก่า") {
			list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
		} else if (choice === "เก่าไปใหม่") {
			list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
		} else if (choice === "ไล่ตามเดดไลน์") {
			list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
		}
		return list;
	}, [rawPosts, choice]);

	return (
		<div>
			<Navbar />
			<section className="body-section gap-[1px] sm:gap-3">
				<div className="text-primary font-[600] text-[24px] sm:text-[28px]">สำรวจกิจกรรม</div>
				<div className="flex flex-col items-end sm:flex-row sm:items-center gap-y-2 sm:gap-x-4">
					<div className="sm:hidden flex gap-x-2 w-full justify-end">
						<Dropdown
							itemClassName="focus:bg-[#de5c8e4d] cursor-pointer text-xs sm:text-sm lg:text-base"
							className="w-fit min-w-[116px] h-[34px] sm:h-[40px] lg:h-[48px] rounded-[6px] text-text-gray text-xs sm:text-sm lg:text-base border-stroke hover:border-primary hover:bg-white hover:text-primary"
							content={[...SORT_OPTIONS]}
							value={choice}
							icon={sortOpen ? <ChevronUp /> : <ChevronDown />}
							onOpenChange={setSortOpen}
							onValueChange={setChoice}
						>
							เรียงลำดับ
						</Dropdown>
					</div>
					<div className="flex gap-x-4 w-full">
						<SearchBar
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="ค้นหากิจกรรม"
							searchIconClassName="sm:left-4 sm:top-2 lg:top-3 sm:h-6 sm:w-6 h-5 w-5 top-2 left-4"
							inputClassName="placeholder:text-text-gray h-[34px] sm:h-[40px] lg:h-[48px] lg:text-base sm:text-sm text-xs placeholder:lg:text-base placeholder:sm:text-sm placeholder:text-xs"
						/>
						<Dropdown
							itemClassName="cursor-pointer text-xs sm:text-sm lg:text-base"
							className="min-w-[138px] w-fit hidden sm:flex h-[34px] sm:h-[40px] lg:h-[48px] rounded-[6px] text-text-gray text-xs sm:text-sm lg:text-base border-stroke hover:border-primary hover:bg-white hover:text-primary"
							content={[...SORT_OPTIONS]}
							value={choice}
							icon={sortOpen ? <ChevronUp /> : <ChevronDown />}
							onOpenChange={setSortOpen}
							onValueChange={setChoice}
						>
							เรียงลำดับ
						</Dropdown>
					</div>
				</div>

				{isLoading ? (
					<div className="w-full h-full flex justify-center items-center text-text-gray p-5">กำลังโหลด...</div>
				) : posts.length === 0 ? (
					<div className="w-full h-full flex justify-center items-center text-text-gray p-5">ไม่พบกิจกรรม</div>
				) : (
					<div className="grid ssm:grid-cols-1 ssm:grid-cols-2 ssm:gap-[6px] sm:flex sm:flex-col sm:gap-y-[24px] py-2">
						{posts.map((event) => (
							<FeedCard
								key={event.id}
								event={{
									id: event.id,
									title: event.title,
									image: event.image,
									description: event.description,
									activityTypeName:
										"activityTypeName" in event
											? (event.activityTypeName as string | null | undefined)
											: undefined,
									instaLink: event.instaLink,
									date: event.date,
									name: "name" in event ? (event.name as string | null | undefined) : undefined,
									userImage:
										"userImage" in event
											? (event.userImage as string | null | undefined)
											: undefined,
								}}
							/>
						))}
					</div>
				)}
			</section>
			<Footer />
		</div>
	);
}
