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

const JSON_PATH = process.argv[2] ?? join(process.cwd(), "data.json");
const PLACEHOLDER_PASSWORD = "ClubImport1234!";

type ClubSocials = { instagram?: string; facebook?: string; tiktok?: string; line?: string };

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

async function main() {
	const clubs = JSON.parse(readFileSync(JSON_PATH, "utf-8")) as CleanClub[];
	console.log(`Loaded ${clubs.length} clubs from ${JSON_PATH}`);

	const facultyRows = await db.select({ id: faculty.id, name: faculty.name }).from(faculty);
	const facultyByName = new Map(facultyRows.map((row) => [row.name, row.id]));

	const interestRows = await db.select({ id: interest.id, name: interest.name }).from(interest);
	const interestByName = new Map(interestRows.map((row) => [row.name, row.id]));

	// Only placeholder-owned orgs (still unclaimed) are safe to overwrite on re-import.
	const existingOrgs = await db
		.select({ id: organization.id, name: organization.name, email: user.email })
		.from(organization)
		.innerJoin(user, eq(user.id, organization.userId));
	const existingOrgByName = new Map(existingOrgs.map((row) => [row.name, row]));

	let created = 0;
	let updated = 0;
	let skipped = 0;

	for (const [index, club] of clubs.entries()) {
		const { name, bio, detailedDescription, facultyName, interestNames, socials, image, gallery } = club;

		const facultyId = facultyName ? (facultyByName.get(facultyName) ?? null) : null;
		if (facultyName && !facultyByName.has(facultyName)) {
			console.warn(`"${name}": faculty "${facultyName}" not found in DB, left unset.`);
		}

		const interestIds = interestNames
			.map((interestName) => interestByName.get(interestName))
			.filter((id): id is string => Boolean(id));

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
					bio,
					detailedDescription,
					ownerContact: { name },
					socials,
					image,
					gallery,
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
			bio,
			detailedDescription,
			gallery,
			recruitmentPeriod: { allYear: true },
			userId: signUpResult.user.id,
			isBanned: false,
			image,
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
