/**
 * Local dev fixtures for the club discovery page (`/clubs`).
 *
 * This is deliberately NOT part of `seed.ts`. That script loads the product's real taxonomy —
 * faculties, interests, activity types — and is idempotent and additive precisely so it can be run
 * against any environment, production included. This one fabricates clubs and student accounts and
 * deletes its own rows on every run, so it must never go near a real database.
 *
 * Everything it creates is identifiable and nothing else is ever touched: organizations, posts and
 * users it invents carry a `seed-` id prefix, and every user it invents has an `@seed.local` email.
 * That is what lets the reset below be scoped instead of a blunt `DELETE FROM organization`.
 *
 *   yarn db:seed              # taxonomy first — the clubs below are linked to it by name
 *   yarn db:seed:clubs        # (re-runnable: it resets its own rows before inserting)
 *   yarn db:seed:clubs:clean  # removes every seeded club, seeded owner, seeded attendee and seeded post.
 *
 * The fixtures cover the cases `/clubs` has to get right: a club past 1,000 followers (the "1.2k"
 * format), a club with more categories than the card can show (the "+N" pill), a club with no bio,
 * logo, faculty or categories at all, and a banned club plus an EVENT-category org that must never
 * appear in the grid.
 */
import "dotenv/config";
import { inArray, like } from "drizzle-orm";
import { db } from "@/server/db";
import { activityType } from "@/server/db/activityType";
import { user } from "@/server/db/auth-schema";
import { faculty } from "@/server/db/faculty";
import { interest } from "@/server/db/interest";
import { interestXOrganization } from "@/server/db/interestXOrganization";
import { interestXPost } from "@/server/db/interestXPost";
import { interestXUser } from "@/server/db/interestXUser";
import { organization } from "@/server/db/organization";
import { post } from "@/server/db/post";
import { userXOrganization } from "@/server/db/userXOrganization";

const ORG_ID_PREFIX = "seed-org-";
const POST_ID_PREFIX = "seed-post-";
const USER_ID_PREFIX = "seed-user-";
const EMAIL_SUFFIX = "@seed.local";

type ClubFixture = {
	slug: string;
	name: string;
	bio: string | null;
	/** Matched against `faculty.name`; null leaves the club without a faculty pill. */
	facultyName: string | null;
	/** Matched against `interest.name` — the UI calls these "Category". */
	interestNames: string[];
	followers: number;
	events: number;
};

const clubs: ClubFixture[] = [
	{
		slug: "thinc",
		name: "Thinc.",
		bio: "A student community committed to promoting real-world profession projects and skills.",
		facultyName: "Engineering",
		interestNames: ["เทคโนโลยี", "สารสนเทศ"],
		// Over 1,000 on purpose: the card must render this as "1.2k".
		followers: 1234,
		events: 12,
	},
	{
		slug: "photo",
		name: "CU Photo Club",
		bio: "Weekly photo walks around campus, darkroom sessions, and a print show every term.",
		facultyName: "Fine and Applied Arts",
		interestNames: ["ศิลปะ"],
		followers: 412,
		events: 8,
	},
	{
		slug: "music",
		name: "ชมรมดนตรีสากลจุฬาฯ",
		bio: "วงดนตรีสากลของนิสิตจุฬาฯ ซ้อมทุกสัปดาห์และเล่นในงานมหาวิทยาลัย",
		// No faculty: the faculty pill is omitted rather than left blank.
		facultyName: null,
		interestNames: ["ดนตรี"],
		followers: 389,
		events: 5,
	},
	{
		slug: "volunteer",
		name: "CU Volunteer",
		bio: "Runs weekend service trips to schools outside Bangkok. No experience needed.",
		facultyName: "Political Science",
		interestNames: ["พัฒนาชุมชน"],
		followers: 301,
		events: 3,
	},
	{
		slug: "business",
		name: "Chula Business Club",
		bio: "Case competitions, startup clinics, and a mentor network across finance and consulting.",
		facultyName: "Commerce and Accountancy",
		interestNames: ["ธุรกิจ"],
		followers: 255,
		events: 6,
	},
	{
		slug: "robotics",
		name: "CU Robotics",
		bio: "Builds autonomous robots for national competitions. Open lab every Thursday evening.",
		facultyName: "Engineering",
		// Three categories plus a faculty: exercises the two-category cap and the "+N" pill.
		interestNames: ["เทคโนโลยี", "การศึกษา", "สารสนเทศ"],
		followers: 198,
		events: 9,
	},
	{
		slug: "sports",
		name: "ชมรมกีฬาจุฬาฯ",
		bio: "กีฬาสำหรับนิสิตทุกระดับ ตั้งแต่เริ่มต้นจนถึงทีมมหาวิทยาลัย",
		facultyName: "Sports Science",
		interestNames: ["กีฬา"],
		followers: 143,
		events: 2,
	},
	{
		slug: "med",
		name: "CU Med Volunteer",
		bio: "Health screening camps in rural provinces, run with the Faculty of Medicine.",
		facultyName: "Medicine",
		interestNames: ["แพทย์", "พัฒนาชุมชน"],
		followers: 97,
		events: 4,
	},
	{
		slug: "chess",
		name: "Chula Chess Society",
		// Nothing at all: a card with no bio, logo, faculty or categories must still be well formed.
		bio: null,
		facultyName: null,
		interestNames: [],
		followers: 0,
		events: 0,
	},
];

/** Neither of these may ever reach the grid. They exist so a regression is visible, not invisible. */
const hiddenOrgs = [
	{ slug: "banned", name: "Banned Club (must not appear)", category: "CLUB" as const, isBanned: true },
	{ slug: "event", name: "Some Event Org (must not appear)", category: "EVENT" as const, isBanned: false },
];

const orgId = (slug: string) => `${ORG_ID_PREFIX}${slug}`;
const ownerId = (slug: string) => `${USER_ID_PREFIX}owner-${slug}`;
const ownerEmail = (slug: string) => `owner-${slug}${EMAIL_SUFFIX}`;
const attendeeId = (n: number) => `${USER_ID_PREFIX}attendee-${n}`;

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

const LOCAL_DB_HOSTS = ["localhost", "127.0.0.1", "::1", "db", "t3-postgres"];

/**
 * Guards on the database this is actually pointed at, not on NODE_ENV — `tsx` leaves NODE_ENV
 * undefined, so an env-based check would wave through `DATABASE_URL=<prod> yarn db:seed:clubs`,
 * which is the one mistake that would really hurt: it inserts fabricated clubs and a four-figure
 * pile of fake student accounts.
 */
function assertLocalDatabase() {
	const url = process.env.DATABASE_URL;
	if (!url) {
		console.error("DATABASE_URL is not set.");
		process.exit(1);
	}

	let host: string;
	try {
		host = new URL(url).hostname;
	} catch {
		console.error("DATABASE_URL is not a valid URL.");
		process.exit(1);
	}

	if (process.env.NODE_ENV === "production" || !LOCAL_DB_HOSTS.includes(host)) {
		console.error(
			`Refusing to run against "${host}". This script fabricates clubs and student accounts and is ` +
				`for local development only. If you really mean it, pass --i-mean-it.`,
		);
		process.exit(1);
	}
}

/**
 * Removes only what this script created, in foreign-key order. `interest_x_post` and
 * `interest_x_user` have no `onDelete: cascade`, so they have to go first by hand; `account`,
 * `session` and `calendar_item` do cascade off the user and post rows.
 */
async function reset(tx: Tx) {
	const seededUserIds = tx
		.select({ id: user.id })
		.from(user)
		.where(like(user.email, `%${EMAIL_SUFFIX}`));

	await tx.delete(interestXPost).where(like(interestXPost.postId, `${POST_ID_PREFIX}%`));
	await tx.delete(post).where(like(post.organizationId, `${ORG_ID_PREFIX}%`));
	await tx
		.delete(interestXOrganization)
		.where(like(interestXOrganization.organizationId, `${ORG_ID_PREFIX}%`));
	await tx.delete(userXOrganization).where(like(userXOrganization.organizationId, `${ORG_ID_PREFIX}%`));
	await tx.delete(userXOrganization).where(inArray(userXOrganization.userId, seededUserIds));
	await tx.delete(organization).where(like(organization.id, `${ORG_ID_PREFIX}%`));
	await tx.delete(interestXUser).where(inArray(interestXUser.userId, seededUserIds));
	await tx.delete(user).where(like(user.email, `%${EMAIL_SUFFIX}`));
}

async function main() {
	if (!process.argv.includes("--i-mean-it")) assertLocalDatabase();

	if (process.argv.includes("--clean")) {
		await db.transaction(async (tx) => reset(tx));
		console.log("Removed every seeded club, seeded owner, seeded attendee and seeded post. Nothing else was touched.");
		return;
	}

	const faculties = await db.select({ id: faculty.id, name: faculty.name }).from(faculty);
	const interests = await db.select({ id: interest.id, name: interest.name }).from(interest);
	const activityTypes = await db.select({ id: activityType.id }).from(activityType).limit(1);

	if (faculties.length === 0 || interests.length === 0 || activityTypes.length === 0) {
		console.error("Taxonomy is missing. Run `yarn db:seed` first — these clubs link to it by name.");
		process.exit(1);
	}

	const facultyIdByName = new Map(faculties.map((row) => [row.name, row.id]));
	const interestIdByName = new Map(interests.map((row) => [row.name, row.id]));
	const defaultActivityTypeId = activityTypes[0]!.id;

	for (const club of clubs) {
		if (club.facultyName && !facultyIdByName.has(club.facultyName)) {
			console.error(`Unknown faculty "${club.facultyName}" on club "${club.name}".`);
			process.exit(1);
		}
		for (const name of club.interestNames) {
			if (!interestIdByName.has(name)) {
				console.error(`Unknown interest "${name}" on club "${club.name}".`);
				process.exit(1);
			}
		}
	}

	// Follower counts are a real aggregate over `user_x_organization`, so the rows have to exist.
	const attendeeCount = Math.max(...clubs.map((club) => club.followers));

	console.log("Seeding demo clubs...");

	await db.transaction(async (tx) => {
		await reset(tx);

		await tx.insert(user).values([
			// Owners exist only to satisfy `organization.user_id`; they carry no `account` row and
			// therefore cannot sign in. Use `/admin/create` if you need an organizer you can log in as.
			...[...clubs, ...hiddenOrgs].map((org) => ({
				id: ownerId(org.slug),
				name: `Owner ${org.slug}`,
				email: ownerEmail(org.slug),
				role: "ORGANIZATION" as const,
				onboardingComplete: true,
				emailVerified: true,
			})),
			...Array.from({ length: attendeeCount }, (_, index) => ({
				id: attendeeId(index + 1),
				name: `Student ${index + 1}`,
				email: `attendee-${index + 1}${EMAIL_SUFFIX}`,
				role: "ATTENDEE" as const,
				onboardingComplete: true,
				emailVerified: true,
			})),
		]);

		await tx.insert(organization).values([
			...clubs.map((club) => ({
				id: orgId(club.slug),
				name: club.name,
				facultyId: club.facultyName ? (facultyIdByName.get(club.facultyName) ?? null) : null,
				category: "CLUB" as const,
				bio: club.bio,
				userId: ownerId(club.slug),
				isBanned: false,
				image: null,
				socials: { discord: "", instagram: "" },
				recruitmentPeriod: {},
			})),
			...hiddenOrgs.map((org) => ({
				id: orgId(org.slug),
				name: org.name,
				facultyId: null,
				category: org.category,
				bio: null,
				userId: ownerId(org.slug),
				isBanned: org.isBanned,
				image: null,
				socials: { discord: "", instagram: "" },
				recruitmentPeriod: {},
			})),
		]);

		const interestLinks = clubs.flatMap((club) =>
			club.interestNames.map((name) => ({
				organizationId: orgId(club.slug),
				interestId: interestIdByName.get(name)!,
			})),
		);
		if (interestLinks.length > 0) await tx.insert(interestXOrganization).values(interestLinks);

		const follows = clubs.flatMap((club) =>
			Array.from({ length: club.followers }, (_, index) => ({
				organizationId: orgId(club.slug),
				userId: attendeeId(index + 1),
			})),
		);
		if (follows.length > 0) await tx.insert(userXOrganization).values(follows);

		const posts = clubs.flatMap((club) =>
			Array.from({ length: club.events }, (_, index) => ({
				id: `${POST_ID_PREFIX}${club.slug}-${index + 1}`,
				organizationId: orgId(club.slug),
				activityTypeId: defaultActivityTypeId,
				title: `${club.name} event ${index + 1}`,
				description: "Seeded event.",
				image: "https://placehold.co/600x400",
				// Past dates on purpose: the card's event count is all-time, with no date cutoff.
				date: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000),
			})),
		);
		if (posts.length > 0) await tx.insert(post).values(posts);
	});

	const visible = clubs.length;
	console.log(
		`Seeded ${visible} clubs (+${hiddenOrgs.length} that must stay hidden), ` +
			`${attendeeCount} attendee accounts, and ${clubs.reduce((n, c) => n + c.events, 0)} posts.`,
	);
	console.log("Remove them any time with: yarn db:seed:clubs:clean");
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main().then(() => process.exit(0));
