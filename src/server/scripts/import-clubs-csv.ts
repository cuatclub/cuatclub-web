import "dotenv/config";
import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { user } from "@/server/db/auth-schema";
import { faculty } from "@/server/db/faculty";
import { interest } from "@/server/db/interest";
import { interestXOrganization } from "@/server/db/interestXOrganization";
import { organization } from "@/server/db/organization";
import { auth } from "@/utils/auth";

const CSV_PATH = process.argv[2] ?? join(process.cwd(), "data.csv");
const PLACEHOLDER_PASSWORD = "ClubImport1234!";

/** Minimal RFC4180 CSV parser: handles quoted fields with embedded commas/newlines/escaped quotes. */
function parseCsv(text: string): string[][] {
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
const CATEGORY_ALIASES: Record<string, string> = {
	กิจกรรม: "ศิลปะ",
	ความบันเทิง: "ศิลปะ",
	บันเทิง: "ศิลปะ",
	การเล่นเกม: "เทคโนโลยี",
	ศาสนา: "พัฒนาชุมชน",
	วาทศิลป์: "การศึกษา",
	สังคมและจิตอาสา: "พัฒนาชุมชน",
};

function mapCategoriesToInterestNames(raw: string, validNames: Set<string>): string[] {
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
const AFFILIATION_MAP: Record<string, string> = {
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
const DUPLICATE_ROW_NAMES = new Set(["ชมรมค่ายอาสาสมัครสโมสรนิสิตจุฬาลงกรณ์มหาวิทยาลัย (VSCU)"]);

const SOCIAL_LABELS: Record<string, string> = {
	instagram: "instagram",
	ig: "instagram",
	facebook: "facebook",
	fb: "facebook",
	tiktok: "tiktok",
	line: "line",
	discord: "discord",
	website: "website",
};
const LABEL_PATTERN = Object.keys(SOCIAL_LABELS).join("|");
/** Scans "Label: value ... Label2: value2" pairs, stopping each value at the next known label. */
const LABEL_VALUE_RE = new RegExp(
	`\\b(${LABEL_PATTERN})\\b\\s*[:;]\\s*(.+?)(?=(?:\\s|^)(?:${LABEL_PATTERN})\\s*[:;]|$)`,
	"gi",
);
/** A handle/URL safe enough to link to — rejects freeform Thai descriptions (e.g. "Openchat ชื่อ Chula Golf Club"). */
const HANDLE_RE = /^[\w@.\-/:]+$/;

/** Best-effort handle extraction from the freeform "Club's Social Media" column. */
function extractSocials(raw: string): Record<string, string> {
	const socials: Record<string, string> = {};
	for (const match of raw.matchAll(LABEL_VALUE_RE)) {
		const key = SOCIAL_LABELS[match[1]!.toLowerCase()]!;
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

async function main() {
	const csvText = readFileSync(CSV_PATH, "utf-8");
	const rows = parseCsv(csvText);
	const [, ...dataRows] = rows;
	console.log(`Parsed ${dataRows.length} club rows from ${CSV_PATH}`);

	const facultyRows = await db.select({ id: faculty.id, name: faculty.name }).from(faculty);
	const facultyByName = new Map(facultyRows.map((row) => [row.name, row.id]));

	const interestRows = await db.select({ id: interest.id, name: interest.name }).from(interest);
	const interestByName = new Map(interestRows.map((row) => [row.name, row.id]));
	const validInterestNames = new Set(interestRows.map((row) => row.name));

	// Only placeholder-owned orgs (still unclaimed) are safe to overwrite on re-import.
	const existingOrgs = await db
		.select({ id: organization.id, name: organization.name, email: user.email })
		.from(organization)
		.innerJoin(user, eq(user.id, organization.userId));
	const existingOrgByName = new Map(existingOrgs.map((row) => [row.name, row]));

	let created = 0;
	let updated = 0;
	let skipped = 0;

	for (const [index, row] of dataRows.entries()) {
		const [
			,
			nameRaw,
			,
			briefDescription,
			detailedDescription,
			socialMediaRaw,
			categoryRaw,
			affiliationRaw,
		] = row;

		const name = nameRaw?.trim();
		if (!name) {
			console.warn(`Row ${index + 2}: missing club name, skipped.`);
			skipped++;
			continue;
		}
		if (DUPLICATE_ROW_NAMES.has(name)) {
			console.log(`Skipping "${name}" — known duplicate submission.`);
			skipped++;
			continue;
		}

		const facultyName = affiliationRaw ? AFFILIATION_MAP[affiliationRaw.trim()] : undefined;
		const facultyId = facultyName ? (facultyByName.get(facultyName) ?? null) : null;
		if (affiliationRaw && !facultyName) {
			console.warn(`Row ${index + 2} ("${name}"): unrecognized affiliation "${affiliationRaw}", left unset.`);
		}

		const interestNames = categoryRaw ? mapCategoriesToInterestNames(categoryRaw, validInterestNames) : [];
		const interestIds = interestNames
			.map((interestName) => interestByName.get(interestName))
			.filter((id): id is string => Boolean(id));
		// `contactRaw` (the form's "club president contact" column) is meant for site-admin
		// communication, not public display — `getClub` is a public procedure, so it's intentionally
		// left out of `ownerContact` here.
		const socials = socialMediaRaw ? extractSocials(socialMediaRaw) : {};

		const existing = existingOrgByName.get(name);
		if (existing) {
			if (!existing.email.startsWith("club-import-")) {
				console.log(`Skipping "${name}" — already claimed by ${existing.email}.`);
				skipped++;
				continue;
			}

			await db
				.update(organization)
				.set({
					facultyId,
					bio: briefDescription?.trim() || null,
					detailedDescription: detailedDescription?.trim() || null,
					ownerContact: { name },
					socials,
				})
				.where(eq(organization.id, existing.id));

			await db.delete(interestXOrganization).where(eq(interestXOrganization.organizationId, existing.id));
			if (interestIds.length > 0) {
				await db.insert(interestXOrganization).values(
					interestIds.map((interestId) => ({ interestId, organizationId: existing.id })),
				);
			}

			console.log(`Updated "${name}" — faculty: ${facultyName ?? "none"}, interests: ${interestNames.join(", ") || "none"}`);
			updated++;
			continue;
		}

		const email = `club-import-${index + 1}@placeholder.cuatclub.com`;
		const signUpResult = await auth.api.signUpEmail({
			body: {
				email,
				password: PLACEHOLDER_PASSWORD,
				name,
				role: "ORGANIZATION",
			},
		});

		await db
			.update(user)
			.set({
				username: `club-import-${index + 1}`,
				facultyId,
				onboardingComplete: false,
				isReceiveMail: false,
				role: "ORGANIZATION",
			})
			.where(eq(user.id, signUpResult.user.id));

		const organizationId = randomUUID();
		await db.insert(organization).values({
			id: organizationId,
			name,
			facultyId,
			category: "CLUB",
			bio: briefDescription?.trim() || null,
			detailedDescription: detailedDescription?.trim() || null,
			gallery: [],
			recruitmentPeriod: { allYear: true },
			userId: signUpResult.user.id,
			isBanned: false,
			image: null,
			ownerContact: { name },
			socials,
		});

		if (interestIds.length > 0) {
			await db.insert(interestXOrganization).values(
				interestIds.map((interestId) => ({ interestId, organizationId })),
			);
		}
		existingOrgByName.set(name, { id: organizationId, name, email });

		console.log(`Created "${name}" — faculty: ${facultyName ?? "none"}, interests: ${interestNames.join(", ") || "none"}`);
		created++;
	}

	console.log(`\nDone. Created ${created}, updated ${updated}, skipped ${skipped}.`);
	console.log(`Placeholder login password for imported clubs: ${PLACEHOLDER_PASSWORD}`);
}

main()
	.then(() => process.exit(0))
	.catch((error: unknown) => {
		console.error(error);
		process.exit(1);
	});
