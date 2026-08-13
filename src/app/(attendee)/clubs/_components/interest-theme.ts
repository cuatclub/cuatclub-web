import {
	BookOpen,
	BriefcaseBusiness,
	Cpu,
	GraduationCap,
	HandHeart,
	HeartPulse,
	Music,
	Palette,
	Sparkles,
	Volleyball,
	type LucideIcon,
} from "lucide-react";

/** `interest.icon` stores a lucide icon name — see the `interests` list in src/server/scripts/seed.ts. */
const ICONS: Record<string, LucideIcon> = {
	BookOpen,
	BriefcaseBusiness,
	Cpu,
	GraduationCap,
	HandHeart,
	HeartPulse,
	Music,
	Palette,
	Volleyball,
};

export const interestIcon = (icon?: string | null): LucideIcon => (icon ? (ICONS[icon] ?? Sparkles) : Sparkles);

export type InterestTheme = { soft: string; ink: string };

export const FALLBACK_THEME: InterestTheme = { soft: "#E7EBF4", ink: "#0F3795" };

/**
 * Ported from branch `refactor`'s `categorySeeds` (src/scripts/seed.ts) — each interest name is
 * itself a category label there, with `backgroundColor`/`fontColor` as `soft`/`ink` here. Keyed
 * by name (not id) so the color for a given category stays fixed across environments/reseeds.
 */
const CATEGORY_THEMES: Record<string, InterestTheme> = {
	การศึกษา: { soft: "#E2E8F0", ink: "#475569" },
	กีฬา: { soft: "#FFEDD5", ink: "#EA580C" },
	ดนตรี: { soft: "#FEE2E2", ink: "#DC2626" },
	เทคโนโลยี: { soft: "#CFFAFE", ink: "#0891B2" },
	ธุรกิจ: { soft: "#F3E8FF", ink: "#9333EA" },
	พัฒนาชุมชน: { soft: "#DCFCE7", ink: "#16A34A" },
	แพทย์: { soft: "#FEF9C3", ink: "#CA8A24" },
	วิชาการ: { soft: "#DBEAFE", ink: "#2563EB" },
	ศิลปะ: { soft: "#FCE7F3", ink: "#DB2777" },
};

export function buildInterestThemes(interests: { id: string; name: string }[]): Map<string, InterestTheme> {
	return new Map(interests.map((interest) => [interest.id, CATEGORY_THEMES[interest.name] ?? FALLBACK_THEME] as const));
}
