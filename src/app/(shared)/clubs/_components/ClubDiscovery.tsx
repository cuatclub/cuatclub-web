"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { SearchBar } from "@/components/ui/SearchBar";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { api, type RouterInputs } from "@/trpc/react";
import { AdvanceFilterDrawer } from "./AdvanceFilterDrawer";
import { ClubCard, type Club } from "./ClubCard";
import { ClubCardSkeleton } from "./ClubCardSkeleton";
import { ClubPagination } from "./ClubPagination";
import { ClubsEmptyState } from "./ClubsEmptyState";
import { Toast } from "./Toast";
import { CLUBS_PAGE_SIZE, useClubFilters } from "./useClubFilters";

type DiscoverInput = RouterInputs["organization"]["discover"];

function isUnauthorized(error: unknown): boolean {
	return (
		typeof error === "object" &&
		error !== null &&
		"data" in error &&
		(error as { data?: { code?: string } }).data?.code === "UNAUTHORIZED"
	);
}

function isConflict(error: unknown): boolean {
	return (
		typeof error === "object" &&
		error !== null &&
		"data" in error &&
		(error as { data?: { code?: string } }).data?.code === "CONFLICT"
	);
}

function prefersReducedMotion(): boolean {
	return (
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches
	);
}

export function ClubDiscovery() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { filters, setFilters } = useClubFilters();
	const { data: session, isPending: isSessionPending } = useSession();

	const gridRef = useRef<HTMLDivElement>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [hasOpenedDrawer, setHasOpenedDrawer] = useState(false);
	const [searchFocused, setSearchFocused] = useState(false);
	const [pendingClubIds, setPendingClubIds] = useState<readonly string[]>([]);
	const [toast, setToast] = useState<{ id: number; message: string } | null>(null);

	const showToast = useCallback((message: string) => {
		setToast({ id: Date.now(), message });
	}, []);
	// Stable, so the toast's auto-dismiss timer is not restarted by every parent re-render.
	const dismissToast = useCallback(() => setToast(null), []);

	const queryInput = useMemo<DiscoverInput>(
		() => ({
			q: filters.q || undefined,
			facultyIds: filters.facultyIds.length ? filters.facultyIds : undefined,
			interestIds: filters.interestIds.length ? filters.interestIds : undefined,
			page: filters.page,
			pageSize: CLUBS_PAGE_SIZE,
		}),
		[filters],
	);

	const { data, isPending, isFetching, isError, refetch } = api.organization.discover.useQuery(
		queryInput,
		// Hold the current page on screen while the next one loads, so paging does not flash skeletons.
		{ placeholderData: (previous) => previous },
	);

	// The taxonomy is only needed once the drawer is opened — don't pay for it on every page view.
	const { data: faculties, isPending: isFacultiesPending } = api.faculty.getAll.useQuery(undefined, {
		enabled: hasOpenedDrawer,
	});
	const { data: interests, isPending: isInterestsPending } = api.interest.getAll.useQuery(undefined, {
		enabled: hasOpenedDrawer,
	});

	/* --- keyword (FR-3) ------------------------------------------------------------------ */

	const [searchText, setSearchText] = useState(filters.q);
	const pushedQueryRef = useRef<string | null>(null);

	// URL → input, but never when we are the ones who just wrote the URL: that would clobber the
	// letters typed during the 300ms debounce. This is what makes the back button work.
	useEffect(() => {
		if (pushedQueryRef.current === filters.q) {
			pushedQueryRef.current = null;
			return;
		}
		setSearchText(filters.q);
	}, [filters.q]);

	const submitSearch = useCallback(
		(value: string) => {
			if (value === filters.q) return;
			pushedQueryRef.current = value;
			setFilters({ q: value, page: 1 }, { replace: true });
		},
		[filters.q, setFilters],
	);

	// Applied automatically at 300ms — no Enter required, no search button. Enter still submits.
	useEffect(() => {
		if (searchText === filters.q) return;
		const timer = setTimeout(() => submitSearch(searchText), 300);
		return () => clearTimeout(timer);
	}, [searchText, filters.q, submitSearch]);

	/* --- pagination (FR-6) --------------------------------------------------------------- */

	const previousPageRef = useRef(filters.page);
	useEffect(() => {
		if (previousPageRef.current === filters.page) return;
		previousPageRef.current = filters.page;
		gridRef.current?.scrollIntoView({
			behavior: prefersReducedMotion() ? "auto" : "smooth",
			block: "start",
		});
	}, [filters.page]);

	/* --- follow (FR-7) ------------------------------------------------------------------- */

	const utils = api.useUtils();
	const followMutation = api.userXOrganization.follow.useMutation();
	const unfollowMutation = api.userXOrganization.unfollow.useMutation();

	const loginHref = useMemo(() => {
		const query = searchParams.toString();
		const returnTo = query ? `/clubs?${query}` : "/clubs";
		return `/auth/attendee/login?redirect=${encodeURIComponent(returnTo)}`;
	}, [searchParams]);

	// `input` is passed in rather than read from scope: an error can land after the user has
	// paged away, and the rollback has to hit the same cache entry the optimistic write did.
	const patchFollow = useCallback(
		(input: DiscoverInput, clubId: string, isFollowing: boolean) => {
			utils.organization.discover.setData(input, (old) => {
				if (!old) return old;
				return {
					...old,
					items: old.items.map((item) =>
						item.id === clubId
							? {
									...item,
									isFollowing,
									// A follow that does not move the number reads as a no-op.
									followerCount: Math.max(0, item.followerCount + (isFollowing ? 1 : -1)),
								}
							: item,
					),
				};
			});
		},
		[utils],
	);

	const handleToggleFollow = useCallback(
		async (club: Club) => {
			if (!isSessionPending && !session?.user) {
				router.push(loginHref);
				return;
			}

			const input = queryInput;
			const nextFollowing = !club.isFollowing;

			setPendingClubIds((ids) => [...ids, club.id]);
			patchFollow(input, club.id, nextFollowing);

			try {
				const variables = { organizationId: club.id };
				if (nextFollowing) await followMutation.mutateAsync(variables);
				else await unfollowMutation.mutateAsync(variables);
				// Deliberately no invalidate: follower count is the sort key, and re-sorting the grid
				// under the user's cursor is worse than a count that catches up on the next fetch.
			} catch (error) {
				patchFollow(input, club.id, !nextFollowing);

				// The session can lapse between page load and click.
				if (isUnauthorized(error)) {
					router.push(loginHref);
					return;
				}
				// The server refuses a follow on your own club, and on a banned one. Neither should
				// reach a student as a raw error.
				if (isConflict(error)) {
					showToast("You can't follow your own club.");
					return;
				}
				showToast(
					nextFollowing
						? "Couldn't follow that club. Try again."
						: "Couldn't unfollow that club. Try again.",
				);
			} finally {
				setPendingClubIds((ids) => ids.filter((id) => id !== club.id));
			}
		},
		[
			followMutation,
			isSessionPending,
			loginHref,
			patchFollow,
			queryInput,
			router,
			session,
			showToast,
			unfollowMutation,
		],
	);

	/* --- render -------------------------------------------------------------------------- */

	const openDrawer = () => {
		setHasOpenedDrawer(true);
		setDrawerOpen(true);
	};

	const applyFilters = (facultyIds: string[], interestIds: string[]) => {
		setDrawerOpen(false);
		setFilters({ facultyIds, interestIds, page: 1 });
	};

	const clubs = data?.items ?? [];
	const isEmpty = !isPending && !isError && data?.total === 0;
	const showGrid = !isError && !isEmpty;

	return (
		<section className="body-section gap-0 py-10 sm:pb-20">
			<h1 className="text-[32px] font-semibold text-[#393e41] md:text-[40px]">
				Discover Clubs at Chula
			</h1>

			<form
				role="search"
				onSubmit={(event) => {
					event.preventDefault();
					submitSearch(searchText);
				}}
				className="mt-6 flex w-full max-w-[800px] items-center gap-2.5"
			>
				<SearchBar
					value={searchText}
					onChange={(event) => setSearchText(event.target.value)}
					onFocus={() => setSearchFocused(true)}
					onBlur={() => setSearchFocused(false)}
					placeholder="search"
					aria-label="Search clubs by name or description"
					containerClassName="min-w-0 flex-1"
					className="rounded-full"
				/>

				<button
					type="button"
					aria-label="Open filters"
					aria-expanded={drawerOpen}
					onClick={openDrawer}
					className={cn(
						"flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-[12px] border bg-white transition-colors",
						"hover:border-primary hover:text-primary",
						"focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
						"motion-reduce:transition-none",
						// Recedes while the keyword field has focus, so the two controls never compete.
						searchFocused ? "border-[#e6e6e6] text-[#c2c3c4]" : "border-stroke text-[#7a7e80]",
					)}
				>
					<SlidersHorizontal className="size-5" />
				</button>
			</form>

			{isError && (
				<div className="mt-8 flex flex-col items-center justify-center gap-4 py-24 text-center">
					<p className="text-lg font-semibold text-[#393e41]">Couldn&apos;t load clubs</p>
					<button
						type="button"
						onClick={() => void refetch()}
						className="h-11 cursor-pointer rounded-full bg-primary px-8 text-[15px] font-semibold text-white transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
					>
						Retry
					</button>
				</div>
			)}

			{isEmpty && <ClubsEmptyState />}

			{showGrid && (
				<div
					ref={gridRef}
					aria-busy={isFetching}
					className={cn(
						"mt-8 grid scroll-mt-24 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
						isFetching && !isPending && "opacity-60 transition-opacity motion-reduce:transition-none",
					)}
				>
					{isPending
						? Array.from({ length: CLUBS_PAGE_SIZE }, (_, index) => (
								<ClubCardSkeleton key={index} />
							))
						: clubs.map((club) => (
								<ClubCard
									key={club.id}
									club={club}
									isFollowPending={pendingClubIds.includes(club.id)}
									onToggleFollow={handleToggleFollow}
								/>
							))}
				</div>
			)}

			{showGrid && !isPending && data && (
				<div className="mt-8">
					<ClubPagination
						page={data.page}
						pageCount={data.pageCount}
						onPageChange={(page) => setFilters({ page })}
					/>
				</div>
			)}

			<AdvanceFilterDrawer
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				faculties={faculties ?? []}
				interests={interests ?? []}
				appliedFacultyIds={filters.facultyIds}
				appliedInterestIds={filters.interestIds}
				onApply={applyFilters}
				isLoadingOptions={hasOpenedDrawer && (isFacultiesPending || isInterestsPending)}
			/>

			{toast && <Toast key={toast.id} message={toast.message} onDismiss={dismissToast} />}
		</section>
	);
}
