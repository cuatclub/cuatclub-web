import "dotenv/config";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { activityType } from "@/server/db/activityType";
import { faculty } from "@/server/db/faculty";
import { interest } from "@/server/db/interest";
import { interestXOrganization } from "@/server/db/interestXOrganization";
import { interestXPost } from "@/server/db/interestXPost";
import { organization } from "@/server/db/organization";
import { post } from "@/server/db/post";
import { user } from "@/server/db/auth-schema";
import { auth } from "@/utils/auth";

const DEMO_PASSWORD = "Demo1234!";

type ClubSeed = {
	email: string;
	orgName: string;
	bio: string;
	instagram: string;
	discord: string;
	interestNames: string[];
	imageLabel: string;
	posts: Array<{
		title: string;
		description: string;
		activityTypeName: string;
		interestNames: string[];
		daysUntilDeadline: number;
		imageLabel: string;
	}>;
};

const clubs: ClubSeed[] = [
	{
		email: "demo.thinc@example.com",
		orgName: "Thinc.",
		bio: "ชมรมเทคโนโลยีที่สร้างโปรเจกต์เพื่อสังคม เปิดรับสมาชิกสาย Dev, Design และ Product",
		instagram: "thinc.chula",
		discord: "discord.gg/thinc-demo",
		interestNames: ["เทคโนโลยี", "สารสนเทศ", "ธุรกิจ"],
		imageLabel: "Thinc",
		posts: [
			{
				title: "Hackathon for Good 2026",
				description:
					"แข่งสร้างโปรเจกต์เพื่อสังคมใน 48 ชั่วโมง มีเวิร์กช็อปเตรียมตัวและรางวัลสำหรับทีมชนะ",
				activityTypeName: "การแข่งขัน",
				interestNames: ["เทคโนโลยี", "พัฒนาชุมชน"],
				daysUntilDeadline: 21,
				imageLabel: "Hackathon",
			},
			{
				title: "Intro to Product Design",
				description: "เวิร์กช็อปออกแบบผลิตภัณฑ์ดิจิทัลสำหรับมือใหม่ พร้อมกรณีศึกษาจริงจากชมรม",
				activityTypeName: "วอร์คชอป / อบรม",
				interestNames: ["เทคโนโลยี", "ศิลปะ"],
				daysUntilDeadline: 10,
				imageLabel: "Design",
			},
		],
	},
	{
		email: "demo.music@example.com",
		orgName: "Chula Music Club",
		bio: "ชุมชนคนรักดนตรี ทั้งร้อง เล่น และโปรดิวซ์ เปิดรับทุกคณะ",
		instagram: "chula.music",
		discord: "discord.gg/music-demo",
		interestNames: ["ดนตรี", "ศิลปะ"],
		imageLabel: "Music",
		posts: [
			{
				title: "Open Mic Night",
				description: "คืนเปิดไมค์สำหรับนักดนตรีและนักร้องสมัครเล่น ลงทะเบียนแสดงได้สูงสุด 3 เพลง",
				activityTypeName: "คอนเสิร์ต / การแสดง",
				interestNames: ["ดนตรี"],
				daysUntilDeadline: 7,
				imageLabel: "OpenMic",
			},
		],
	},
	{
		email: "demo.volunteer@example.com",
		orgName: "CU Volunteer",
		bio: "ชมรมอาสาพัฒนาชุมชน จัดกิจกรรมภาคสนามและแคมเปญระดมทุนตลอดปี",
		instagram: "cu.volunteer",
		discord: "discord.gg/volunteer-demo",
		interestNames: ["พัฒนาชุมชน", "การศึกษา"],
		imageLabel: "Volunteer",
		posts: [
			{
				title: "ค่ายอาสาภาคฤดูร้อน",
				description: "ออกค่ายพัฒนาโรงเรียนในต่างจังหวัด 4 วัน 3 คืน ค่าใช้จ่ายสนับสนุนบางส่วน",
				activityTypeName: "กิจกรรมอาสา / ชุมชน",
				interestNames: ["พัฒนาชุมชน", "การศึกษา"],
				daysUntilDeadline: 30,
				imageLabel: "Camp",
			},
			{
				title: "Blood Donation Drive",
				description: "ร่วมบริจาคโลหิตกับสภากาชาดไทย จุดรับบริจาคที่ตึกอักษร ชั้น 1",
				activityTypeName: "อื่นๆ",
				interestNames: ["แพทย์", "พัฒนาชุมชน"],
				daysUntilDeadline: 5,
				imageLabel: "Blood",
			},
		],
	},
	{
		email: "demo.sports@example.com",
		orgName: "CU Sports Society",
		bio: "ชมรมกีฬาหลากหลายชนิด เน้นสุขภาพและมิตรภาพข้ามคณะ",
		instagram: "cu.sports",
		discord: "discord.gg/sports-demo",
		interestNames: ["กีฬา"],
		imageLabel: "Sports",
		posts: [
			{
				title: "Inter-Faculty Football Cup",
				description: "ทัวร์นาเมนต์ฟุตบอลระหว่างคณะ สมัครเป็นทีม 7 คนขึ้นไป",
				activityTypeName: "กิจกรรมกีฬา",
				interestNames: ["กีฬา"],
				daysUntilDeadline: 14,
				imageLabel: "Football",
			},
		],
	},
	{
		email: "demo.biz@example.com",
		orgName: "Chula Entrepreneurs",
		bio: "ชมรมธุรกิจและการลงทุน จัดทอล์ก Networking และพิตช์เดย์",
		instagram: "chula.entrepreneurs",
		discord: "discord.gg/biz-demo",
		interestNames: ["ธุรกิจ", "การศึกษา"],
		imageLabel: "Biz",
		posts: [
			{
				title: "Startup Pitch Night",
				description: "เวทีพิตช์ไอเดียสตาร์ทอัพให้นักลงทุนและเมนเทอร์ในวงการ ได้ฟีดแบ็กแบบเรียลไทม์",
				activityTypeName: "Networking",
				interestNames: ["ธุรกิจ", "เทคโนโลยี"],
				daysUntilDeadline: 18,
				imageLabel: "Pitch",
			},
			{
				title: "Finance 101 Seminar",
				description: "สัมมนาความรู้การเงินส่วนบุคคลและการลงทุนเบื้องต้น สำหรับนักศึกษาปี 1–2",
				activityTypeName: "สัมมนา / บรรยาย",
				interestNames: ["ธุรกิจ", "การศึกษา"],
				daysUntilDeadline: 12,
				imageLabel: "Finance",
			},
		],
	},
];

function placeholderImage(label: string, w = 400, h = 500) {
	return `https://placehold.co/${w}x${h}/DE5C8E/FFFFFF/png?text=${encodeURIComponent(label)}`;
}

async function ensureUser(opts: {
	email: string;
	name: string;
	role: "ATTENDEE" | "ORGANIZATION";
	facultyId?: string | null;
	interestIds?: string[];
}) {
	const existing = await db.query.user.findFirst({
		where: eq(user.email, opts.email),
	});

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
				notifyEventReminders: true,
				notifyMatchingEvents: true,
				notifyClubUpdates: true,
			})
			.where(eq(user.id, userId));
		console.log(`  · user exists, refreshed: ${opts.email}`);
	} else {
		const result = await auth.api.signUpEmail({
			body: {
				email: opts.email,
				password: DEMO_PASSWORD,
				name: opts.name,
				role: opts.role,
			},
		});
		userId = result.user.id;
		await db
			.update(user)
			.set({
				onboardingComplete: true,
				facultyId: opts.facultyId ?? null,
				isReceiveMail: true,
				notifyEventReminders: true,
				notifyMatchingEvents: true,
				notifyClubUpdates: true,
				role: opts.role,
			})
			.where(eq(user.id, userId));
		console.log(`  · created user: ${opts.email}`);
	}

	if (opts.interestIds && opts.interestIds.length > 0) {
		const { interestXUser } = await import("@/server/db/interestXUser");
		await db.delete(interestXUser).where(eq(interestXUser.userId, userId));
		await db.insert(interestXUser).values(
			opts.interestIds.map((interestId) => ({
				userId,
				interestId,
			})),
		);
	}

	return userId;
}

async function main() {
	console.log("Seeding demo data (clubs, posts, demo accounts)...");

	const faculties = await db.select().from(faculty);
	const interests = await db.select().from(interest);
	const activityTypes = await db.select().from(activityType);

	if (faculties.length === 0 || interests.length === 0 || activityTypes.length === 0) {
		throw new Error("Missing base seed data. Run `yarn db:seed` first, then `yarn db:seed:demo`.");
	}

	const facultyByName = new Map(faculties.map((f) => [f.name, f.id]));
	const interestByName = new Map(interests.map((i) => [i.name, i.id]));
	const activityByName = new Map(activityTypes.map((a) => [a.name, a.id]));

	const engineeringFacultyId = facultyByName.get("Engineering") ?? faculties[0]!.id;
	const economicsFacultyId = facultyByName.get("Economics") ?? faculties[0]!.id;

	const demoInterestIds = ["เทคโนโลยี", "ธุรกิจ", "ดนตรี"]
		.map((name) => interestByName.get(name))
		.filter((id): id is string => !!id);

	console.log("Creating demo attendee...");
	await ensureUser({
		email: "demo.attendee@example.com",
		name: "Demo Attendee",
		role: "ATTENDEE",
		facultyId: economicsFacultyId,
		interestIds: demoInterestIds,
	});

	for (const club of clubs) {
		console.log(`Seeding club: ${club.orgName}`);
		const orgUserId = await ensureUser({
			email: club.email,
			name: club.orgName,
			role: "ORGANIZATION",
			facultyId: engineeringFacultyId,
		});

		let org = await db.query.organization.findFirst({
			where: eq(organization.userId, orgUserId),
		});

		if (!org) {
			const orgId = randomUUID();
			await db.insert(organization).values({
				id: orgId,
				name: club.orgName,
				facultyId: engineeringFacultyId,
				category: "CLUB",
				averageHoursPerWeek: 8,
				bio: club.bio,
				recruitmentPeriod: { allYear: true },
				userId: orgUserId,
				isBanned: false,
				image: placeholderImage(club.imageLabel, 200, 200),
				socials: {
					instagram: club.instagram,
					discord: club.discord,
					signUpForm: `https://example.com/signup/${club.instagram}`,
				},
			});
			org = await db.query.organization.findFirst({
				where: eq(organization.id, orgId),
			});
		} else {
			await db
				.update(organization)
				.set({
					name: club.orgName,
					category: "CLUB",
					bio: club.bio,
					image: placeholderImage(club.imageLabel, 200, 200),
					socials: {
						instagram: club.instagram,
						discord: club.discord,
						signUpForm: `https://example.com/signup/${club.instagram}`,
					},
					isBanned: false,
				})
				.where(eq(organization.id, org.id));
		}

		if (!org) throw new Error(`Failed to create org for ${club.orgName}`);

		await db.delete(interestXOrganization).where(eq(interestXOrganization.organizationId, org.id));
		const orgInterestIds = club.interestNames
			.map((name) => interestByName.get(name))
			.filter((id): id is string => !!id);
		if (orgInterestIds.length > 0) {
			await db.insert(interestXOrganization).values(
				orgInterestIds.map((interestId) => ({
					interestId,
					organizationId: org!.id,
				})),
			);
		}

		const existingPosts = await db.select().from(post).where(eq(post.organizationId, org.id));
		if (existingPosts.length === 0) {
			for (const p of club.posts) {
				const activityTypeId = activityByName.get(p.activityTypeName);
				if (!activityTypeId) {
					console.warn(`  ! skip post "${p.title}" — missing activity type ${p.activityTypeName}`);
					continue;
				}
				const postId = randomUUID();
				const deadline = new Date();
				deadline.setDate(deadline.getDate() + p.daysUntilDeadline);
				deadline.setHours(23, 59, 59, 0);

				await db.insert(post).values({
					id: postId,
					organizationId: org.id,
					activityTypeId,
					title: p.title,
					description: p.description,
					instaLink: `https://instagram.com/${club.instagram}`,
					image: placeholderImage(p.imageLabel),
					date: deadline,
				});

				const postInterestIds = p.interestNames
					.map((name) => interestByName.get(name))
					.filter((id): id is string => !!id);
				if (postInterestIds.length > 0) {
					await db.insert(interestXPost).values(
						postInterestIds.map((interestId) => ({
							interestId,
							postId,
						})),
					);
				}
				console.log(`  · created post: ${p.title}`);
			}
		} else {
			console.log(`  · posts already exist (${existingPosts.length}), skipped`);
		}
	}

	console.log("\nDemo seed completed.\n");
	console.log("─── Login credentials (password for all: Demo1234!) ───");
	console.log("Attendee:  demo.attendee@example.com");
	console.log("Orgs:      demo.thinc@example.com");
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
