import {
	BriefcaseBusiness,
	Cpu,
	GraduationCap,
	HandHeart,
	HeartPulse,
	Monitor,
	Music,
	Palette,
	Sparkles,
	Volleyball,
	type LucideIcon,
} from "lucide-react";

/** `interest.icon` stores a lucide icon name — see the `interests` list in src/server/scripts/seed.ts. */
const ICONS: Record<string, LucideIcon> = {
	BriefcaseBusiness,
	Cpu,
	GraduationCap,
	HandHeart,
	HeartPulse,
	Monitor,
	Music,
	Palette,
	Volleyball,
};

export const interestIcon = (icon?: string | null): LucideIcon => (icon ? (ICONS[icon] ?? Sparkles) : Sparkles);

/** Figma "club tag category" pairs: 50-level fill with 500-level ink. */
export const THEMES = [
	{ soft: "#E7EBF4", ink: "#0F3795" },
	{ soft: "#FFFAE6", ink: "#E8BA00" },
	{ soft: "#FAEAFC", ink: "#CB30E0" },
	{ soft: "#FCF0E6", ink: "#E06C00" },
	{ soft: "#E8F5ED", ink: "#1B9D46" },
	{ soft: "#FDE6E6", ink: "#E90000" },
	{ soft: "#FCEFF4", ink: "#DE5C8E" },
	{ soft: "#E6F9FD", ink: "#00C0E8" },
] as const;

export type InterestTheme = (typeof THEMES)[number];

export const FALLBACK_THEME: InterestTheme = THEMES[0];

/**
 * Colours are handed out by position in the interest list rather than hashed from the label.
 * A multiplicative hash bucketed with `% 8` collapses on Thai names — every Thai codepoint sits
 * in U+0E00–U+0E7F, so the low bits carry almost no entropy and most names land in one bucket.
 *
 * Sorting by id first keeps the assignment stable between requests, because `interest.getAll`
 * has no ORDER BY and Postgres makes no row-order guarantee.
 */
export function buildInterestThemes(interests: { id: string }[]): Map<string, InterestTheme> {
	return new Map(
		[...interests]
			.sort((a, b) => a.id.localeCompare(b.id))
			.map((interest, index) => [interest.id, THEMES[index % THEMES.length]!] as const),
	);
}
