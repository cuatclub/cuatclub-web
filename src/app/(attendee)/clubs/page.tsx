"use client";

import { useMemo, useState } from "react";
import ClubCard from "./_components/ClubCard";
import { Footer } from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Navbar";
import { SearchBar } from "@/components/ui/SearchBar";
import { themeColor } from "@/app/(organization)/posts/_components/PostCard";
import { api } from "@/trpc/react";

export default function ClubsPage() {
	const [search, setSearch] = useState("");
	const utils = api.useUtils();

	const { data: organizations, isLoading } = api.organization.getAll.useQuery();
	const { data: followedIds = [] } = api.userXOrganization.getMineFollowed.useQuery();
	const followMutation = api.userXOrganization.follow.useMutation({
		onSuccess: async () => {
			await utils.userXOrganization.getMineFollowed.invalidate();
		},
	});
	const unfollowMutation = api.userXOrganization.unfollow.useMutation({
		onSuccess: async () => {
			await utils.userXOrganization.getMineFollowed.invalidate();
		},
	});

	const followedSet = useMemo(() => new Set(followedIds), [followedIds]);

	const clubs = useMemo(() => {
		const list = (organizations ?? []).filter((org) => org.category === "CLUB" && !org.isBanned);
		const query = search.trim().toLowerCase();
		if (!query) return list;
		return list.filter(
			(org) =>
				org.name.toLowerCase().includes(query) ||
				(org.bio ?? "").toLowerCase().includes(query) ||
				(org.socials?.instagram ?? "").toLowerCase().includes(query),
		);
	}, [organizations, search]);

	const busyOrgId =
		followMutation.isPending || unfollowMutation.isPending
			? (followMutation.variables?.organizationId ?? unfollowMutation.variables?.organizationId)
			: undefined;

	const handleToggleFollow = (organizationId: string, followed: boolean) => {
		if (followed) {
			unfollowMutation.mutate({ organizationId });
		} else {
			followMutation.mutate({ organizationId });
		}
	};

	return (
		<div>
			<Navbar />
			<section className="body-section">
				<h1>สำรวจชมรม</h1>
				<div className="flex flex-col gap-4 sm:gap-6 w-full">
					<div className="flex gap-2 sm:gap-4 w-full">
						<SearchBar
							className="w-full"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="ค้นหาชมรม"
						/>
					</div>

					{isLoading ? (
						<div className="w-full flex justify-center items-center text-text-gray p-8">กำลังโหลด...</div>
					) : clubs.length === 0 ? (
						<div className="w-full flex justify-center items-center text-text-gray p-8">ไม่พบชมรม</div>
					) : (
						<div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
							{clubs.map((club) => {
								const interests =
									"interests" in club && Array.isArray(club.interests)
										? (club.interests as Array<{ interest?: { name?: string | null } | null }>)
										: [];
								const followed = followedSet.has(club.id);
								return (
									<ClubCard
										key={club.id}
										id={club.id}
										name={club.name}
										description={club.bio ?? ""}
										tag={club.socials?.instagram ?? ""}
										imageUrl={club.image ?? ""}
										categories={interests.map((row, idx) => ({
											name: row.interest?.name ?? "อื่นๆ",
											color: themeColor[idx % themeColor.length]!,
										}))}
										followed={followed}
										followBusy={busyOrgId === club.id}
										onToggleFollow={() => handleToggleFollow(club.id, followed)}
									/>
								);
							})}
						</div>
					)}
				</div>
			</section>
			<Footer />
		</div>
	);
}
