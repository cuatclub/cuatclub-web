"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** FR-6: 6 clubs per page, at every breakpoint. */
export const CLUBS_PAGE_SIZE = 6;

export type ClubFilters = {
	q: string;
	facultyIds: string[];
	/** The drawer's "Category" field. These are `interest` ids — not `organization.category`. */
	interestIds: string[];
	page: number;
};

function parseList(value: string | null): string[] {
	if (!value) return [];
	return value
		.split(",")
		.map((id) => id.trim())
		.filter(Boolean);
}

/**
 * The URL is the single source of truth for the grid (FR-5), so a result set is shareable
 * and the back button walks the search history.
 */
export function useClubFilters() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const filters = useMemo<ClubFilters>(() => {
		const page = Number.parseInt(searchParams.get("page") ?? "1", 10);
		return {
			q: searchParams.get("q") ?? "",
			facultyIds: parseList(searchParams.get("faculty")),
			interestIds: parseList(searchParams.get("category")),
			page: Number.isFinite(page) && page > 0 ? page : 1,
		};
	}, [searchParams]);

	const setFilters = useCallback(
		(next: Partial<ClubFilters>, options?: { replace?: boolean }) => {
			const merged = { ...filters, ...next };
			const params = new URLSearchParams();
			if (merged.q) params.set("q", merged.q);
			if (merged.facultyIds.length) params.set("faculty", merged.facultyIds.join(","));
			if (merged.interestIds.length) params.set("category", merged.interestIds.join(","));
			if (merged.page > 1) params.set("page", String(merged.page));

			const query = params.toString();
			const url = query ? `${pathname}?${query}` : pathname;

			// Keystrokes replace, so back steps over a search rather than through every letter of it.
			// Applying a filter or changing page pushes, so back undoes those one at a time.
			if (options?.replace) router.replace(url, { scroll: false });
			else router.push(url, { scroll: false });
		},
		[filters, pathname, router],
	);

	return { filters, setFilters };
}
