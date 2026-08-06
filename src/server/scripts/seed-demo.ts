import "dotenv/config";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { faculties } from "@/server/db/schema/faculties";
import { categories } from "@/server/db/schema/categories";
import { clubs } from "@/server/db/schema/clubs";
import { clubCategories } from "@/server/db/schema/club-categories";
import { user } from "@/server/db/schema/user";
import { auth } from "@/utils/auth";

const DEMO_PASSWORD = "Demo1234!";

function placeholderImage(label: string, w = 400, h = 500) {
	return `https://placehold.co/${w}x${h}/DE5C8E/FFFFFF/png?text=${encodeURIComponent(label)}`;
}

type DemoClub = {
	email: string;
	name: string;
	facultyName: string;
	categoryLabels: string[];
	shortDescription: string;
	longDescription: string;
	instagram: string;
	imageLabel: string;
};

const demoClubs: DemoClub[] = [
	{
		email: "demo.thinc@example.com",
		name: "Thinc.",
		facultyName: "Engineering",
		categoryLabels: ["เทคโนโลยี", "วิชาการ"],
		shortDescription: "ชมรมเทคโนโลยีที่สร้างโปรเจกต์เพื่อสังคม เปิดรับสมาชิกสาย Dev, Design และ Product",
		longDescription:
			"Thinc. จัดกิจกรรม Hackathon, workshop และ product clinic ให้สมาชิกได้ฝึกทักษะการพัฒนาโปรเจกต์จริงตั้งแต่แนวคิดถึงการใช้งาน",
		instagram: "thinc.chula",
		imageLabel: "Thinc",
	},
	{
		email: "demo.music@example.com",
		name: "Chula Music Club",
		facultyName: "Arts",
		categoryLabels: ["ดนตรี", "ศิลปะ"],
		shortDescription: "ชุมชนคนรักดนตรี ทั้งร้อง เล่น และโปรดิวซ์ เปิดรับทุกคณะ",
		longDescription: "จัด Open Mic, studio session และ workshop เรียบเรียงเพลงตลอดปีการศึกษา",
		instagram: "chula.music",
		imageLabel: "Music",
	},
	{
		email: "demo.volunteer@example.com",
		name: "CU Volunteer",
		facultyName: "Political Science",
		categoryLabels: ["พัฒนาชุมชน", "วิชาการ"],
		shortDescription: "ชมรมอาสาพัฒนาชุมชน จัดกิจกรรมภาคสนามและแคมเปญระดมทุนตลอดปี",
		longDescription: "ออกค่ายพัฒนาโรงเรียนในต่างจังหวัดและจัดแคมเปญบริจาคโลหิตร่วมกับสภากาชาดไทยเป็นประจำ",
		instagram: "cu.volunteer",
		imageLabel: "Volunteer",
	},
	{
		email: "demo.sports@example.com",
		name: "CU Sports Society",
		facultyName: "Sports Science",
		categoryLabels: ["กีฬา"],
		shortDescription: "ชมรมกีฬาหลากหลายชนิด เน้นสุขภาพและมิตรภาพข้ามคณะ",
		longDescription: "จัดทัวร์นาเมนต์ระหว่างคณะและกิจกรรมออกกำลังกายกลุ่มตลอดภาคการศึกษา",
		instagram: "cu.sports",
		imageLabel: "Sports",
	},
	{
		email: "demo.biz@example.com",
		name: "Chula Entrepreneurs",
		facultyName: "Commerce and Accountancy",
		categoryLabels: ["ธุรกิจ", "วิชาการ"],
		shortDescription: "ชมรมธุรกิจและการลงทุน จัดทอล์ก Networking และพิตช์เดย์",
		longDescription: "เวทีสำหรับคนที่อยากเรียนรู้เรื่อง startup, finance และ product-market fit ผ่าน pitch night และ mentor circle",
		instagram: "chula.entrepreneurs",
		imageLabel: "Biz",
	},
];

async function ensureUser(opts: {
	email: string;
	name: string;
	role: "ATTENDEE" | "CLUB";
	facultyId?: number | null;
}) {
	const existing = await db.query.user.findFirst({ where: eq(user.email, opts.email) });

	let userId: string;
	if (existing) {
		userId = existing.id;
		await db
			.update(user)
			.set({
				name: opts.name,
				role: opts.role,
				onboardingComplete: true,
				facultyId: opts.facultyId ?? existing.facultyId,
				isReceiveMail: true,
				emailVerified: true,
			})
			.where(eq(user.id, userId));
		console.log(`  · user exists, refreshed: ${opts.email}`);
	} else {
		const result = await auth.api.signUpEmail({
			body: { email: opts.email, password: DEMO_PASSWORD, name: opts.name, role: opts.role },
		});
		userId = result.user.id;
		await db
			.update(user)
			.set({
				onboardingComplete: true,
				facultyId: opts.facultyId ?? null,
				isReceiveMail: true,
				emailVerified: true,
				role: opts.role,
			})
			.where(eq(user.id, userId));
		console.log(`  · created user: ${opts.email}`);
	}

	return userId;
}

async function main() {
	console.log("Seeding demo data (clubs, demo accounts)...");

	const facultiesRows = await db.select().from(faculties);
	const categoryRows = await db.select().from(categories);

	if (facultiesRows.length === 0 || categoryRows.length === 0) {
		throw new Error("Missing base seed data. Run `yarn db:seed` first, then `yarn db:seed:demo`.");
	}

	const facultyByLabel = new Map(facultiesRows.map((f) => [f.label, f.id]));
	const categoryByLabel = new Map(categoryRows.map((c) => [c.label, c.id]));

	console.log("Creating demo attendee...");
	await ensureUser({
		email: "demo.attendee@example.com",
		name: "Demo Attendee",
		role: "ATTENDEE",
		facultyId: facultyByLabel.get("Economics") ?? facultiesRows[0]!.id,
	});

	for (const demoClub of demoClubs) {
		console.log(`Seeding club: ${demoClub.name}`);
		const clubUserId = await ensureUser({
			email: demoClub.email,
			name: demoClub.name,
			role: "CLUB",
		});

		let club = await db.query.clubs.findFirst({ where: eq(clubs.userId, clubUserId) });
		const facultyId = facultyByLabel.get(demoClub.facultyName) ?? facultiesRows[0]!.id;

		if (!club) {
			const clubId = randomUUID();
			await db.insert(clubs).values({
				id: clubId,
				userId: clubUserId,
				email: demoClub.email,
				registrationStatus: "COMPLETED",
				name: demoClub.name,
				logoUrl: placeholderImage(demoClub.imageLabel, 200, 200),
				facultyId,
				shortDescription: demoClub.shortDescription,
				longDescription: demoClub.longDescription,
				imageUrls: [placeholderImage(demoClub.imageLabel)],
				contacts: { instagram: demoClub.instagram },
			});
			club = await db.query.clubs.findFirst({ where: eq(clubs.id, clubId) });
		} else {
			await db
				.update(clubs)
				.set({
					name: demoClub.name,
					registrationStatus: "COMPLETED",
					logoUrl: placeholderImage(demoClub.imageLabel, 200, 200),
					facultyId,
					shortDescription: demoClub.shortDescription,
					longDescription: demoClub.longDescription,
					imageUrls: [placeholderImage(demoClub.imageLabel)],
					contacts: { instagram: demoClub.instagram },
				})
				.where(eq(clubs.id, club.id));
		}

		if (!club) throw new Error(`Failed to create club for ${demoClub.name}`);

		await db.delete(clubCategories).where(eq(clubCategories.clubId, club.id));
		const categoryIds = demoClub.categoryLabels
			.map((label) => categoryByLabel.get(label))
			.filter((id): id is number => id !== undefined);
		if (categoryIds.length > 0) {
			await db.insert(clubCategories).values(categoryIds.map((categoryId) => ({ clubId: club.id, categoryId })));
		}
	}

	console.log("\nDemo seed completed.\n");
	console.log("─── Login credentials (password for all: Demo1234!) ───");
	console.log("Attendee:  demo.attendee@example.com");
	console.log("Clubs:     demo.thinc@example.com");
	console.log("           demo.music@example.com");
	console.log("           demo.volunteer@example.com");
	console.log("           demo.sports@example.com");
	console.log("           demo.biz@example.com");
	console.log("───────────────────────────────────────────────────────");
}

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
