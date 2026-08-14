import "dotenv/config";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { ALLOWED_IMAGE_TYPES, IMAGE_EXT_MAP, uploadImage } from "@/server/services/r2";
import {
	AFFILIATION_MAP,
	CLUB_SLUGS,
	DUPLICATE_ROW_NAMES,
	extractDriveFileId,
	extractSocials,
	mapCategoriesToInterestNames,
	parseCsv,
	type ClubSocials,
} from "@/server/scripts/lib/club-import-shared";

const CSV_PATH = process.argv[2] ?? join(process.cwd(), "data.csv");
const OUT_PATH = process.argv[3] ?? join(process.cwd(), "data.json");

// The alias map already resolves every category label in this CSV to one of these 9 seeded interests
// (see `db:seed`). Kept as a literal set here so Stage 1 needs no DB access to validate mappings.
const VALID_INTEREST_NAMES = new Set([
	"ธุรกิจ",
	"เทคโนโลยี",
	"แพทย์",
	"กีฬา",
	"พัฒนาชุมชน",
	"วิชาการ",
	"ศิลปะ",
	"ดนตรี",
	"การศึกษา",
]);

type CleanClub = {
	name: string;
	slug: string;
	bio: string | null;
	detailedDescription: string | null;
	facultyName: string | null;
	interestNames: string[];
	socials: ClubSocials;
	image: string | null;
	gallery: string[];
};

async function downloadDriveFile(fileId: string): Promise<{ buffer: Buffer; contentType: string } | null> {
	const res = await fetch(`https://drive.usercontent.google.com/download?id=${fileId}&export=download`);
	if (!res.ok) return null;

	const contentType = res.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
	if (!ALLOWED_IMAGE_TYPES.includes(contentType as (typeof ALLOWED_IMAGE_TYPES)[number])) {
		// Most commonly an HTML login/consent page — the Drive file isn't actually shared publicly.
		return null;
	}

	const buffer = Buffer.from(await res.arrayBuffer());
	return { buffer, contentType };
}

async function uploadDriveImage(url: string, key: string): Promise<string | null> {
	const fileId = extractDriveFileId(url);
	if (!fileId) {
		console.warn(`  Could not parse Drive file id from "${url}"`);
		return null;
	}

	const file = await downloadDriveFile(fileId);
	if (!file) {
		console.warn(`  Failed to download Drive file ${fileId} (not public, or not an image) — skipped.`);
		return null;
	}

	const ext = IMAGE_EXT_MAP[file.contentType] ?? "jpg";
	return uploadImage(file.buffer, file.contentType, `${key}.${ext}`);
}

async function main() {
	const csvText = readFileSync(CSV_PATH, "utf-8");
	const rows = parseCsv(csvText);
	const [, ...dataRows] = rows;
	console.log(`Parsed ${dataRows.length} club rows from ${CSV_PATH}`);

	const clubs = new Map<string, CleanClub>();
	let imagesUploaded = 0;
	let imagesFailed = 0;

	for (const [index, row] of dataRows.entries()) {
		const [
			,
			nameRaw,
			logoRaw,
			briefDescription,
			detailedDescription,
			socialMediaRaw,
			categoryRaw,
			affiliationRaw,
			galleryRaw,
		] = row;

		const name = nameRaw?.trim();
		if (!name) {
			console.warn(`Row ${index + 2}: missing club name, skipped.`);
			continue;
		}
		if (DUPLICATE_ROW_NAMES.has(name)) {
			console.log(`Skipping "${name}" — known duplicate submission.`);
			continue;
		}

		const slug = CLUB_SLUGS[name];
		if (!slug) {
			console.warn(`Row ${index + 2} ("${name}"): no R2 slug mapping found — skipped entirely.`);
			continue;
		}

		console.log(`Processing "${name}" (${slug})...`);

		const facultyName = affiliationRaw ? (AFFILIATION_MAP[affiliationRaw.trim()] ?? null) : null;
		if (affiliationRaw && !facultyName) {
			console.warn(`  Unrecognized affiliation "${affiliationRaw}", left unset.`);
		}

		const interestNames = categoryRaw
			? mapCategoriesToInterestNames(categoryRaw, VALID_INTEREST_NAMES)
			: [];

		const socials = socialMediaRaw ? extractSocials(socialMediaRaw) : {};

		let image: string | null = null;
		if (logoRaw?.trim()) {
			image = await uploadDriveImage(logoRaw.trim(), `clubs/${slug}/logo`);
			if (image) {
				imagesUploaded++;
			} else {
				imagesFailed++;
			}
		}

		const gallery: string[] = [];
		const galleryUrls = galleryRaw
			? [...new Set(galleryRaw.split(",").map((s) => s.trim()).filter(Boolean))]
			: [];
		for (const [i, url] of galleryUrls.entries()) {
			const uploaded = await uploadDriveImage(url, `clubs/${slug}/image${i + 1}`);
			if (uploaded) {
				gallery.push(uploaded);
				imagesUploaded++;
			} else {
				imagesFailed++;
			}
		}

		clubs.set(name, {
			name,
			slug,
			bio: briefDescription?.trim() ? briefDescription.trim() : null,
			detailedDescription: detailedDescription?.trim() ? detailedDescription.trim() : null,
			facultyName,
			interestNames,
			socials,
			image,
			gallery,
		});
	}

	const result = [...clubs.values()];
	writeFileSync(OUT_PATH, JSON.stringify(result, null, 2), "utf-8");

	console.log(
		`\nDone. Wrote ${result.length} clubs to ${OUT_PATH}. Images uploaded: ${imagesUploaded}, failed: ${imagesFailed}.`,
	);
	if (imagesFailed > 0) {
		console.log(
			"Some images failed to download/upload (see warnings above) — likely still not shared publicly on Drive.",
		);
	}
}

main().catch((error: unknown) => {
	console.error(error);
	process.exit(1);
});
