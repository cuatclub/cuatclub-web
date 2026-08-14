/** Minimal RFC4180 CSV parser: handles quoted fields with embedded commas/newlines/escaped quotes. */
export function parseCsv(text: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = "";
	let inQuotes = false;

	for (let i = 0; i < text.length; i++) {
		const char = text[i];

		if (inQuotes) {
			if (char === '"') {
				if (text[i + 1] === '"') {
					field += '"';
					i++;
				} else {
					inQuotes = false;
				}
			} else {
				field += char;
			}
			continue;
		}

		if (char === '"') {
			inQuotes = true;
		} else if (char === ",") {
			row.push(field);
			field = "";
		} else if (char === "\n" || char === "\r") {
			if (char === "\r" && text[i + 1] === "\n") i++;
			row.push(field);
			field = "";
			if (row.some((cell) => cell !== "")) rows.push(row);
			row = [];
		} else {
			field += char;
		}
	}
	if (field !== "" || row.length > 0) {
		row.push(field);
		rows.push(row);
	}
	return rows;
}

/** Google Form category label -> canonical interest name (strips " (English)" suffix). */
export const CATEGORY_ALIASES: Record<string, string> = {
	กิจกรรม: "ศิลปะ",
	ความบันเทิง: "ศิลปะ",
	บันเทิง: "ศิลปะ",
	การเล่นเกม: "เทคโนโลยี",
	ศาสนา: "พัฒนาชุมชน",
	วาทศิลป์: "การศึกษา",
	สังคมและจิตอาสา: "พัฒนาชุมชน",
};

export function mapCategoriesToInterestNames(raw: string, validNames: Set<string>): string[] {
	const names = new Set<string>();
	for (const part of raw.split(",")) {
		const label = part.replace(/\s*\([^)]*\)\s*/g, "").trim();
		if (!label) continue;
		const mapped = validNames.has(label) ? label : (CATEGORY_ALIASES[label] ?? null);
		if (mapped) names.add(mapped);
	}
	return [...names];
}

/** Google Form affiliation label -> faculty name (matches branch `refactor`'s affiliation labels). */
export const AFFILIATION_MAP: Record<string, string> = {
	"ชมรมฝ่ายกีฬา อบจ. / Department of Sports": "ฝ่ายกีฬา อบจ.",
	"ชมรมฝ่ายพัฒนาสังคมและบำเพ็ญประโยชน์ อบจ / Department of Social Development and Volunteer Works":
		"ฝ่ายพัฒนาสังคมและบำเพ็ญประโยชน์ อบจ.",
	"ชมรมฝ่ายวิชาการ อบจ. / Department of Academic Affairs": "ฝ่ายวิชาการ อบจ.",
	"ชมรมฝ่ายศิลปะวัฒนธรรม อบจ. / Department of Arts and Culture": "ฝ่ายศิลปะวัฒนธรรม อบจ.",
	"ชมรมสังกัดคณะ คณะครุศาสตร์ / Faculty of Education": "ครุศาสตร์",
	"ชมรมสังกัดคณะ คณะจิตวิทยา / Faculty of Psychology": "จิตวิทยา",
	"ชมรมสังกัดคณะ คณะวิทยาศาสตร์การกีฬา / Faculty of Sports Science": "วิทยาศาสตร์การกีฬา",
	"ชมรมสังกัดคณะ คณะวิศวกรรมศาสตร์ / Faculty of Engineering": "วิศวกรรมศาสตร์",
	"ชมรมสังกัดคณะ คณะสหเวชศาสตร์ / Faculty of Allied Health Sciences": "สหเวชศาสตร์",
	"ชมรมสังกัดคณะ คณะอักษรศาสตร์ / Faculty of Arts": "อักษรศาสตร์",
	"ชมรมสังกัดคณะ คณะเภสัชศาสตร์ / Faculty of Pharmaceutical Sciences": "เภสัชศาสตร์",
	"ชมรมสังกัดคณะ คณะเศรษฐศาสตร์ / Faculty of Economics": "เศรษฐศาสตร์",
};

/**
 * Rows that are re-submissions of another row under a shorter/looser name (verified manually).
 * The fuller-named row is kept; these get skipped so re-imports don't recreate the duplicate.
 */
export const DUPLICATE_ROW_NAMES = new Set(["ชมรมค่ายอาสาสมัครสโมสรนิสิตจุฬาลงกรณ์มหาวิทยาลัย (VSCU)"]);

/** Manually curated English transliteration for R2 path slugs (most club names are Thai-only). */
export const CLUB_SLUGS: Record<string, string> = {
	"GRDC Game Research and Development club ชมรมวิจัยและพัฒนาเกม": "grdc_game_dev_club",
	ชมรมแฮนด์บอล: "handball_club",
	"CU Golf Club": "cu_golf_club",
	ชมรมกีฬายิงปืน: "shooting_club",
	ชมรมเทเบิลเทนนิส: "table_tennis_club",
	เเบดมินตัน: "badminton_club",
	ยูยิตสู: "jiujitsu_club",
	"สาราณียกร คณะอักษรศาสตร์": "saraniyakorn_arts_club",
	ชมรมอิงคลิศวิชชาหรรษา: "english_fun_club",
	ฟันดาบสากล: "fencing_club",
	"ชมรมศิลปวัฒนธรรมล้านนา จุฬาลงกรณ์มหาวิทยาลัย": "lanna_culture_club",
	"ชมรมดนตรีไทย สโมสรนิสิตจุฬาลงกรณ์มหาวิทยาลัย/CU Thai Classical Music Club":
		"cu_thai_classical_music_club",
	ชมรมเซปักตะกร้อ: "sepak_takraw_club",
	"EDU COOL DEBATE/ ชมรมโต้วาทีคณะครุศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย": "edu_cool_debate_club",
	"RxCU Dancing Club": "rxcu_dancing_club",
	"ชมรมวาทศิลป์และมนุษยสัมพันธ์ (Rhetoric and Human Relations - Chulalongkorn Debate Club)":
		"rhetoric_human_relations_club",
	"Arts Boxing ชมรมมวยสากลสมัครเล่น คณะอักษณศาสตร์": "arts_boxing_club",
	"ชมรมวอลเลย์บอล คณะครุศาสตร์": "education_volleyball_club",
	"ชมรมทูตเยาวชนนานาชาติและสันติภาพสากล(iGEN)": "igen_club",
	ชมรมเพาะกายเเละฟิตเนสจุฬา: "bodybuilding_fitness_club",
	พุทธธรรมจุฬาฯ: "buddhadhamma_club",
	เรือใบและเรือพาย: "sailing_rowing_club",
	ชมรมยิงธนู: "archery_club",
	"ชมรมซอฟท์บอล สโมสรนิสิตจุฬาลงกรณ์มหาวิทยาลัย": "softball_club",
	"ชมรมบอร์ดเกมคณะเศรษฐศาสตร์ (econboardgame)": "econ_boardgame_club",
	"ชมรมกีฬาอิเล็กทรอนิกส์ (Chula Esports)": "chula_esports_club",
	ดาบไทย: "thai_sword_club",
	เภสัชสังคีต: "pharmacy_music_club",
	"Psyche Step-up": "psyche_stepup_club",
	"ชมรมนักร้องประสานเสียง สโมสรนิสิตจุฬาลงกรณ์มหาวิทยาลัย": "choir_club",
	"Psychemusic CU": "psychemusic_cu_club",
	ชมรมสันทนาการกลอง: "drum_recreation_club",
	"AHS CU Dance Club": "ahscu_dance_club",
	"CUVI (Chula Value Investor Club)": "cuvi_club",
	ชมรมพัฒนาความฉลาดทางอารมณ์: "eq_development_club",
	"AHSCU Sports Club": "ahscu_sports_club",
	ชมรมพุทธศาสตร์และประเพณี: "buddhism_tradition_club",
	"ชมรมถ่ายภาพคณะจิตวิทยา / psychephoto": "psychephoto_club",
	"ชมรมคาทอลิก จุฬาลงกรณ์มหาวิทยาลัย / Catholic club of Chulalongkorn University": "catholic_club",
	Sahavejwathi: "sahavejwathi_club",
	"CU Tomorrow (ชมรมกิจกรรมและสันทนาการ)": "cu_tomorrow_club",
	"Mother of Sahavej": "mother_of_sahavej_club",
	"ชมรมลีลาศ คณะอักษรศาสตร์ จุฬาฯ / Arts CU DanceSport Club": "arts_dancesport_club",
	"ชมรมผู้นำเชียร์และคัลเลอร์การ์ดแห่งคณะสหเวชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย หรือ AHSCU Cheerclub":
		"ahscu_cheer_club",
	"ชมรมจุฬาฯ สู่ชุมชน (Slumclub)": "slumclub",
	"CU Band (ชมรมดนตรีสากล สโมสรนิสิตจุฬาลงกรณ์มหาวิทยาลัย)": "cu_band_club",
	"AHSCU BAND": "ahscu_band_club",
	"Economics’ Central Frequency (ECF)": "ecf_club",
	"ชมรมค่ายอาสาพัฒนาชาวไทยภูเขา จุฬาลงกรณ์มหาวิทยาลัย (Hill Tribe Club Chula)": "hill_tribe_club",
	"ชมรมค่ายอาสาสมัครสโมสรนิสิตจุฬาลงกรณ์มหาวิทยาลัย Voluntary Club Of the student Union Chulalongkorn University (VSCU)":
		"vscu_club",
	"ชมรมค่ายอาสาสมัครสโมสรนิสิตจุฬาลงกรณ์มหาวิทยาลัย (VSCU)": "vscu_club",
	เต้นแห่งจุฬาลงกรณ์มหาวิทยาลัย: "cu_dance_club",
	อักษราวาทิต: "aksarawathit_club",
	ชมรมอาสาพัฒนาเพื่อเด็กด้อยโอกาสแห่งจุฬาลงกรณ์มหาวิทยาลัย: "cvvc_club",
};

const SOCIAL_LABELS: Record<string, string> = {
	instagram: "instagram",
	ig: "instagram",
	facebook: "facebook",
	fb: "facebook",
	tiktok: "tiktok",
	line: "line",
};
const LABEL_PATTERN = Object.keys(SOCIAL_LABELS).join("|");
/** Scans "Label: value ... Label2: value2" pairs, stopping each value at the next known label. */
const LABEL_VALUE_RE = new RegExp(
	`\\b(${LABEL_PATTERN})\\b\\s*[:;]\\s*(.+?)(?=(?:[\\s,/]|^)(?:${LABEL_PATTERN})\\s*[:;]|$)`,
	"gi",
);
/** A handle/URL safe enough to link to — rejects freeform Thai descriptions (e.g. "Openchat ชื่อ Chula Golf Club"). */
const HANDLE_RE = /^[\w@.\-/:]+$/;

export type ClubSocials = { instagram?: string; facebook?: string; tiktok?: string; line?: string };

/** Best-effort handle extraction from the freeform "Club's Social Media" column, scoped to ig/fb/tiktok/line only. */
export function extractSocials(raw: string): ClubSocials {
	const socials: ClubSocials = {};
	for (const match of raw.matchAll(LABEL_VALUE_RE)) {
		const key = SOCIAL_LABELS[match[1]!.toLowerCase()] as keyof ClubSocials;
		if (socials[key]) continue;

		const value = match[2]!.trim().replace(/[,/]+$/, "").trim();
		const urlMatch = /https?:\/\/\S+/.exec(value);
		if (urlMatch) {
			// e.g. "chulaesports (https://www.instagram.com/chulaesports/)" — prefer the URL over the handle.
			socials[key] = urlMatch[0].replace(/[)\],.]+$/, "");
		} else if (HANDLE_RE.test(value)) {
			socials[key] = value;
		}
		// Multi-word values (e.g. "Aksorn Sara", "Openchat ชื่อ Chula Golf Club") are display names, not
		// linkable handles — skipped rather than truncated to a misleading partial value.
	}
	return socials;
}

/** Extracts the Drive file id from a "drive.google.com/open?id=..." share link. */
export function extractDriveFileId(url: string): string | null {
	try {
		const parsed = new URL(url.trim());
		return parsed.searchParams.get("id");
	} catch {
		return null;
	}
}
