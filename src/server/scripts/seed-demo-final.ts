import "dotenv/config";
import { randomUUID } from "crypto";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/server/db";
import { activityType } from "@/server/db/activityType";
import { faculty } from "@/server/db/faculty";
import { interest } from "@/server/db/interest";
import { interestXOrganization } from "@/server/db/interestXOrganization";
import { interestXPost } from "@/server/db/interestXPost";
import { interestXUser } from "@/server/db/interestXUser";
import { organization } from "@/server/db/organization";
import { post } from "@/server/db/post";
import { user } from "@/server/db/auth-schema";
import { auth } from "@/utils/auth";

/**
 * Demo seed shaped so every control on /clubs has something to prove.
 *
 * The club records mirror the Google form that goes out to real organizations, one property per
 * question, so a real response can be pasted in as-is:
 *
 *   Q1 club name            -> name
 *   Q2 profile photo        -> placeholderImage(imageLabel) until real uploads exist
 *   Q3 bio                  -> bio
 *   Q4 detailedDescription  -> detailedDescription
 *   Q5 socials              -> socials, exactly one of instagram/facebook/tiktok/line
 *   Q6 interest             -> interestNames, mixed single and multiple
 *   Q7 faculty              -> facultyName, resolved against the faculty table
 *   Q8 gallery              -> hardcoded [] at insert time (see seedClub)
 *   Q9 ownerContact         -> ownerContact, exactly one of email/phone/line
 *
 * Everything below `// not on the form` is filler the app needs but the form never asks for.
 *
 * Re-running is safe: accounts are matched by email, org rows are refreshed field-for-field, and
 * interests/posts are replaced. Only rows owned by these demo emails are ever touched.
 */

const DEMO_PASSWORD = "Demo1234!";

/** /clubs slices results by this. Kept in sync with `PAGE_SIZE` in src/app/(attendee)/clubs/page.tsx. */
const PAGE_SIZE = 8;

/** Named so a typo becomes a compile error instead of a silently empty filter bucket. */
const FACULTY = {
	architecture: "Architecture",
	arts: "Arts",
	commerce: "Commerce and Accountancy",
	commArts: "Communication Arts",
	economics: "Economics",
	education: "Education",
	engineering: "Engineering",
	fineArts: "Fine and Applied Arts",
	medicine: "Medicine",
	politicalScience: "Political Science",
	science: "Science",
	sportsScience: "Sports Science",
} as const;

const INTEREST = {
	business: "ธุรกิจ",
	tech: "เทคโนโลยี",
	medical: "แพทย์",
	sports: "กีฬา",
	community: "พัฒนาชุมชน",
	informatics: "สารสนเทศ",
	art: "ศิลปะ",
	music: "ดนตรี",
	education: "การศึกษา",
} as const;

const ACTIVITY = {
	seminar: "สัมมนา / บรรยาย",
	workshop: "วอร์คชอป / อบรม",
	competition: "การแข่งขัน",
	exhibition: "นิทรรศการ / งานแสดง",
	performance: "คอนเสิร์ต / การแสดง",
	volunteer: "กิจกรรมอาสา / ชุมชน",
	networking: "Networking",
	sports: "กิจกรรมกีฬา",
	recruitment: "งานเปิดรับสมัคร / รับสมาชิก",
	other: "อื่นๆ",
} as const;

type OrganizationInsert = typeof organization.$inferInsert;
type Socials = NonNullable<OrganizationInsert["socials"]>;
type OwnerContact = NonNullable<OrganizationInsert["ownerContact"]>;
type RecruitmentPeriod = NonNullable<OrganizationInsert["recruitmentPeriod"]>;

type PostSeed = {
	title: string;
	description: string;
	activityTypeName: string;
	interestNames: string[];
	daysUntilDeadline: number;
	imageLabel: string;
};

type ClubSeed = {
	email: string;
	name: string;
	imageLabel: string;
	bio: string;
	detailedDescription: string;
	socials: Socials;
	interestNames: string[];
	facultyName: string;
	ownerContact: OwnerContact;
	// not on the form
	averageHoursPerWeek: number;
	recruitmentPeriod: RecruitmentPeriod;
	/** Defaults to CLUB. An EVENT row exists only to prove /clubs filters it out. */
	category?: "CLUB" | "EVENT";
	/** Defaults to false. The one banned row exists only to prove /clubs filters it out. */
	isBanned?: boolean;
	posts?: PostSeed[];
};

function daysFromNow(days: number) {
	const date = new Date();
	date.setDate(date.getDate() + days);
	date.setHours(23, 59, 59, 0);
	return date;
}

/**
 * 30 visible clubs, deliberately lopsided rather than evenly spread:
 * Engineering holds 9 and เทคโนโลยี holds 9, so filtering by either still spans two pages.
 * Eleven faculties are left with no clubs at all, which is the quickest route to the empty state.
 */
const clubs: ClubSeed[] = [
	{
		email: "demo.thinc@example.com",
		name: "Thinc.",
		imageLabel: "Thinc",
		bio: "ชมรมเทคโนโลยีที่สร้างโปรเจกต์เพื่อสังคม เปิดรับสมาชิกสาย Dev, Design และ Product",
		detailedDescription:
			"Thinc. รวมนิสิตที่อยากใช้ซอฟต์แวร์แก้ปัญหาจริงในสังคม ทุกภาคการศึกษาเราจับทีมข้ามสาย Dev, Design และ Product แล้วปล่อยโปรเจกต์ออกสู่ผู้ใช้จริง โดยมีรุ่นพี่และเมนเทอร์จากบริษัทเทคโนโลยีคอยรีวิวงานให้ตลอดทาง สมาชิกใหม่ไม่จำเป็นต้องเขียนโค้ดเป็นมาก่อน เพราะมีคลาสปูพื้นฐานให้ในเดือนแรก",
		socials: { instagram: "thinc.chula" },
		interestNames: [INTEREST.tech, INTEREST.informatics, INTEREST.business],
		facultyName: FACULTY.engineering,
		ownerContact: { name: "พี่ฟ้า (ประธานชมรม)", email: "thinc.contact@example.com" },
		averageHoursPerWeek: 8,
		recruitmentPeriod: { allYear: true },
		posts: [
			{
				title: "Hackathon for Good 2026",
				description: "แข่งสร้างโปรเจกต์เพื่อสังคมใน 48 ชั่วโมง มีเวิร์กช็อปเตรียมตัวและรางวัลสำหรับทีมชนะ",
				activityTypeName: ACTIVITY.competition,
				interestNames: [INTEREST.tech, INTEREST.community],
				daysUntilDeadline: 21,
				imageLabel: "Hackathon",
			},
			{
				title: "Intro to Product Design",
				description: "เวิร์กช็อปออกแบบผลิตภัณฑ์ดิจิทัลสำหรับมือใหม่ พร้อมกรณีศึกษาจริงจากชมรม",
				activityTypeName: ACTIVITY.workshop,
				interestNames: [INTEREST.tech, INTEREST.art],
				daysUntilDeadline: 10,
				imageLabel: "Design",
			},
		],
	},
	{
		email: "demo.robotics@example.com",
		name: "CU Robotics Club",
		imageLabel: "CURC",
		bio: "ชมรมหุ่นยนต์จุฬาฯ ออกแบบ ประกอบ และส่งหุ่นยนต์ลงแข่งระดับประเทศทุกปี",
		detailedDescription:
			"เราทำงานกันเป็นทีมย่อยตามความถนัด ทั้งงานกลไก งานวงจร และงานเขียนโปรแกรมควบคุม เป้าหมายหลักของแต่ละปีคือการส่งหุ่นยนต์ลงแข่งรายการระดับประเทศอย่างน้อยสองรายการ ห้องชมรมเปิดให้ใช้เครื่องมือและเครื่องพิมพ์สามมิติได้ทุกวันทำการ และมีคลาสสอนพื้นฐานไมโครคอนโทรลเลอร์ให้สมาชิกปีหนึ่งช่วงต้นเทอม",
		socials: { facebook: "cu.robotics.club" },
		interestNames: [INTEREST.tech],
		facultyName: FACULTY.engineering,
		ownerContact: { name: "พี่กันต์ (หัวหน้าฝ่ายเทคนิค)", phone: "080-111-2233" },
		averageHoursPerWeek: 12,
		recruitmentPeriod: { start: daysFromNow(-14), end: daysFromNow(30) },
		posts: [
			{
				title: "Robot Design Bootcamp",
				description: "ค่ายสามวันสำหรับผู้เริ่มต้น ตั้งแต่อ่านแบบกลไกจนถึงเขียนโปรแกรมควบคุมมอเตอร์",
				activityTypeName: ACTIVITY.workshop,
				interestNames: [INTEREST.tech],
				daysUntilDeadline: 16,
				imageLabel: "Robot",
			},
		],
	},
	{
		email: "demo.drone@example.com",
		name: "CU Drone Society",
		imageLabel: "Drone",
		bio: "ชุมชนคนบินโดรน ตั้งแต่ถ่ายภาพมุมสูงจนถึงการแข่งโดรนเรซซิ่ง",
		detailedDescription:
			"กิจกรรมของเราแบ่งเป็นสองสาย สายถ่ายภาพที่เน้นการวางแผนเส้นทางบินและการเก็บภาพมุมสูงรอบมหาวิทยาลัย กับสายเรซซิ่งที่ประกอบเฟรมและจูนคอนโทรลเลอร์เอง สมาชิกจะได้เรียนกฎการบินและการขออนุญาตพื้นที่อย่างถูกต้องก่อนขึ้นบินจริงเสมอ",
		socials: { tiktok: "cu.drone" },
		interestNames: [INTEREST.tech, INTEREST.informatics],
		facultyName: FACULTY.engineering,
		ownerContact: { name: "พี่ณัฐ (เลขาชมรม)", email: "cu.drone@example.com" },
		averageHoursPerWeek: 6,
		recruitmentPeriod: { start: daysFromNow(-7), end: daysFromNow(21) },
	},
	{
		email: "demo.engvolunteer@example.com",
		name: "ชมรมวิศวกรรมอาสา",
		imageLabel: "EngVol",
		bio: "นำความรู้วิศวกรรมไปซ่อมสร้างให้โรงเรียนและชุมชนที่ขาดแคลนทั่วประเทศ",
		detailedDescription:
			"ทุกปิดภาคเราออกค่ายไปซ่อมอาคารเรียน เดินระบบไฟ และวางระบบน้ำสะอาดให้โรงเรียนขนาดเล็กในต่างจังหวัด ก่อนออกค่ายจะมีการสำรวจพื้นที่จริงและออกแบบร่วมกับชุมชนเสมอ เพื่อให้สิ่งที่สร้างถูกใช้งานต่อได้จริงหลังเรากลับ สมาชิกทุกคณะสมัครได้ ไม่จำเป็นต้องมีพื้นฐานงานช่าง",
		socials: { tiktok: "eng.volunteer.cu" },
		interestNames: [INTEREST.community, INTEREST.education],
		facultyName: FACULTY.engineering,
		ownerContact: { name: "พี่มิ้นท์ (ฝ่ายประสานงาน)", line: "@engvolunteer" },
		averageHoursPerWeek: 5,
		recruitmentPeriod: { start: daysFromNow(-30), end: daysFromNow(14) },
	},
	{
		email: "demo.datascience@example.com",
		name: "CU Data Science Club",
		imageLabel: "CUDS",
		bio: "ชมรมวิทยาการข้อมูล เรียนรู้การวิเคราะห์ข้อมูลและแมชชีนเลิร์นนิงผ่านโจทย์จริง",
		detailedDescription:
			"เราเปิดกลุ่มอ่านเปเปอร์ทุกสองสัปดาห์และจัดแข่งวิเคราะห์ข้อมูลภายในชมรมทุกภาคการศึกษา โจทย์ที่ใช้มาจากชุดข้อมูลเปิดของหน่วยงานรัฐและจากพาร์ตเนอร์ภาคเอกชน สมาชิกจะได้ฝึกตั้งแต่การทำความสะอาดข้อมูลไปจนถึงการนำเสนอผลให้ผู้ที่ไม่ได้มีพื้นฐานเชิงเทคนิคเข้าใจ",
		socials: { facebook: "cu.datascience" },
		interestNames: [INTEREST.tech, INTEREST.informatics],
		facultyName: FACULTY.engineering,
		ownerContact: { name: "พี่ปอนด์ (ประธานชมรม)", email: "cuds.club@example.com" },
		averageHoursPerWeek: 6,
		recruitmentPeriod: { allYear: true },
	},
	{
		email: "demo.motorsport@example.com",
		name: "Chula Motorsport",
		imageLabel: "CUMS",
		bio: "ทีมนิสิตที่ออกแบบและสร้างรถแข่งฟอร์มูล่าลงแข่งขันในรายการนักศึกษา",
		detailedDescription:
			"หนึ่งปีการศึกษาคือหนึ่งคันรถ ตั้งแต่การออกแบบเฟรม การเลือกระบบส่งกำลัง ไปจนถึงการทดสอบในสนามจริง ทีมแบ่งเป็นฝ่ายวิศวกรรมและฝ่ายบริหารที่ดูแลสปอนเซอร์และงบประมาณ ทำให้นิสิตสายบริหารและสายสื่อสารก็มีที่ยืนในทีมเช่นกัน",
		socials: { instagram: "chula.motorsport" },
		interestNames: [INTEREST.tech, INTEREST.sports],
		facultyName: FACULTY.engineering,
		ownerContact: { name: "พี่เจแปน (ทีมเมเนเจอร์)", phone: "081-444-5566" },
		averageHoursPerWeek: 12,
		recruitmentPeriod: { start: daysFromNow(-3), end: daysFromNow(40) },
	},
	{
		email: "demo.energy@example.com",
		name: "ชมรมพลังงานทดแทนจุฬาฯ",
		imageLabel: "Energy",
		// "โซลาร์เซลล์" appears in no other club's name, bio, faculty or interest — the bio-only search case.
		bio: "ติดตั้งแผงโซลาร์เซลล์ให้ชุมชนที่ไฟฟ้าเข้าไม่ถึง พร้อมอบรมการดูแลรักษาให้คนในพื้นที่ทำต่อเองได้",
		detailedDescription:
			"เราติดตั้งแผงโซลาร์เซลล์ให้โรงเรียนและศูนย์การเรียนรู้ในพื้นที่ห่างไกล พร้อมอบรมการดูแลรักษาให้คนในพื้นที่ทำเองได้ นอกจากงานภาคสนาม ชมรมยังจัดวงเสวนาเรื่องนโยบายพลังงานและการเปลี่ยนผ่านสู่พลังงานสะอาดร่วมกับคณะอื่นเป็นประจำ",
		socials: { line: "@cuenergyclub" },
		interestNames: [INTEREST.tech, INTEREST.community],
		facultyName: FACULTY.engineering,
		ownerContact: { name: "พี่ตะวัน (ประธานชมรม)", line: "@tawan.energy" },
		averageHoursPerWeek: 5,
		recruitmentPeriod: { start: daysFromNow(-20), end: daysFromNow(25) },
	},
	{
		email: "demo.cybersec@example.com",
		name: "CU Cybersecurity Guild",
		imageLabel: "CUSec",
		bio: "ชมรมความมั่นคงปลอดภัยไซเบอร์ ฝึก CTF และการทดสอบเจาะระบบอย่างมีจริยธรรม",
		detailedDescription:
			"สมาชิกฝึกโจทย์ Capture The Flag ประจำสัปดาห์ ครอบคลุมทั้งงานเว็บ งานวิเคราะห์ไบนารี และงานนิติวิทยาศาสตร์ดิจิทัล ชมรมเน้นย้ำเรื่องขอบเขตทางกฎหมายและจริยธรรมก่อนลงมือทุกครั้ง และส่งทีมลงแข่งรายการระดับประเทศปีละสองครั้ง",
		socials: { facebook: "cu.cybersec.guild" },
		interestNames: [INTEREST.tech, INTEREST.informatics],
		facultyName: FACULTY.engineering,
		ownerContact: { name: "พี่อาร์ม (หัวหน้าทีมแข่ง)", email: "cusec.guild@example.com" },
		averageHoursPerWeek: 7,
		recruitmentPeriod: { allYear: true },
	},
	{
		email: "demo.intania@example.com",
		name: "Intania Music Band",
		imageLabel: "Intania",
		bio: "วงดนตรีประจำคณะวิศวฯ เล่นทั้งงานรับน้อง งานกีฬา และคอนเสิร์ตประจำปี",
		detailedDescription:
			"วงเปิดรับทั้งนักดนตรีที่เล่นเป็นแล้วและคนที่เพิ่งเริ่มจับเครื่องดนตรี เรามีห้องซ้อมประจำและรุ่นพี่ที่สอนให้ฟรีในช่วงต้นเทอม ตารางงานหลักคือคอนเสิร์ตประจำปีปลายภาคปลาย ซึ่งสมาชิกทุกคนจะได้ขึ้นเวทีอย่างน้อยหนึ่งเพลง",
		socials: { instagram: "intania.band" },
		interestNames: [INTEREST.music],
		facultyName: FACULTY.engineering,
		ownerContact: { name: "พี่บอส (หัวหน้าวง)", phone: "089-222-7788" },
		averageHoursPerWeek: 6,
		recruitmentPeriod: { start: daysFromNow(-10), end: daysFromNow(18) },
	},
	{
		email: "demo.astronomy@example.com",
		name: "CU Astronomy Club",
		imageLabel: "CUAstro",
		bio: "ชมรมดาราศาสตร์ จัดกิจกรรมดูดาวและสอนใช้กล้องโทรทรรศน์สำหรับผู้เริ่มต้น",
		detailedDescription:
			"เราจัดทริปดูดาวนอกเมืองภาคละหนึ่งครั้ง และเปิดลานดูดาวในมหาวิทยาลัยทุกคืนเดือนมืด สมาชิกจะได้เรียนการตั้งกล้องโทรทรรศน์ การอ่านแผนที่ดาว และการถ่ายภาพวัตถุท้องฟ้าเบื้องต้น ชมรมมีกล้องให้ยืมโดยไม่ต้องมีอุปกรณ์ของตัวเอง",
		socials: { tiktok: "cu.astronomy" },
		interestNames: [INTEREST.tech, INTEREST.education],
		facultyName: FACULTY.science,
		ownerContact: { name: "พี่ดาว (ประธานชมรม)", line: "@cuastro" },
		averageHoursPerWeek: 4,
		recruitmentPeriod: { allYear: true },
	},
	{
		email: "demo.biofield@example.com",
		name: "ชมรมชีววิทยาภาคสนาม",
		imageLabel: "BioField",
		bio: "ออกสำรวจระบบนิเวศจริง เก็บข้อมูลความหลากหลายทางชีวภาพร่วมกับชุมชนท้องถิ่น",
		detailedDescription:
			"ชมรมจัดทริปสำรวจป่าชายเลนและป่าต้นน้ำปีละสองครั้ง สมาชิกจะได้ฝึกวิธีสำรวจภาคสนาม การจำแนกชนิดพันธุ์ และการบันทึกข้อมูลลงฐานข้อมูลเปิด ข้อมูลที่เก็บได้ถูกส่งต่อให้กลุ่มอนุรักษ์ในพื้นที่ใช้งานต่อจริง",
		socials: { facebook: "biofield.cu" },
		interestNames: [INTEREST.community, INTEREST.education],
		facultyName: FACULTY.science,
		ownerContact: { name: "พี่ใบเฟิร์น (ฝ่ายวิชาการ)", email: "biofield.cu@example.com" },
		averageHoursPerWeek: 4,
		recruitmentPeriod: { start: daysFromNow(-25), end: daysFromNow(12) },
	},
	{
		email: "demo.scicomm@example.com",
		name: "Chula Science Communicators",
		imageLabel: "SciComm",
		bio: "เปลี่ยนงานวิจัยให้เป็นเรื่องเล่าที่คนทั่วไปเข้าใจ ผ่านบทความ คลิป และนิทรรศการ",
		detailedDescription:
			"เราผลิตคอนเทนต์วิทยาศาสตร์เผยแพร่สู่สาธารณะทุกสัปดาห์ ทั้งบทความสั้น คลิปอธิบาย และโปสเตอร์สำหรับงานนิทรรศการ สมาชิกจะได้ฝึกสัมภาษณ์นักวิจัยจริงและเรียบเรียงเนื้อหาให้ถูกต้องแต่ยังอ่านสนุก ชมรมยังจัดเวิร์กช็อปการนำเสนอให้นิสิตคณะอื่นตามคำเชิญด้วย",
		socials: { instagram: "chula.scicomm" },
		interestNames: [INTEREST.education],
		facultyName: FACULTY.science,
		ownerContact: { name: "พี่แพร (บรรณาธิการ)", phone: "082-909-1122" },
		averageHoursPerWeek: 5,
		recruitmentPeriod: { allYear: true },
	},
	{
		email: "demo.chess@example.com",
		name: "CU Chess Club",
		imageLabel: "CUChess",
		bio: "ชมรมหมากรุกสากล เปิดกระดานให้เล่นทุกเย็นวันพุธ ไม่จำกัดระดับฝีมือ",
		detailedDescription:
			"ทุกเย็นวันพุธเราเปิดโต๊ะให้เล่นอิสระและมีรุ่นพี่คอยวิเคราะห์เกมให้หลังจบ ชมรมจัดการแข่งขันภายในแบบสวิสระบบสี่รอบทุกปลายภาค และส่งตัวแทนลงแข่งรายการมหาวิทยาลัย สมาชิกใหม่ที่เพิ่งเริ่มเล่นมีคลาสสอนเปิดหมากให้แยกต่างหาก",
		socials: { line: "@cuchess" },
		interestNames: [INTEREST.sports],
		facultyName: FACULTY.science,
		ownerContact: { name: "พี่ต้นน้ำ (ประธานชมรม)", line: "@tonnam.chess" },
		averageHoursPerWeek: 3,
		recruitmentPeriod: { allYear: true },
	},
	{
		email: "demo.film@example.com",
		name: "CU Film Society",
		imageLabel: "CUFilm",
		bio: "ชมรมภาพยนตร์ ฉายหนังนอกกระแสและผลิตหนังสั้นของนิสิตเอง",
		detailedDescription:
			"เราจัดฉายหนังพร้อมวงสนทนาหลังฉายเดือนละสองครั้ง และเปิดกองถ่ายหนังสั้นของชมรมภาคละหนึ่งเรื่อง สมาชิกเลือกได้ว่าจะอยู่ฝ่ายเขียนบท กำกับ ถ่ายภาพ หรือตัดต่อ อุปกรณ์กล้องและไฟของชมรมให้ยืมใช้ได้ตลอดการถ่ายทำ",
		socials: { instagram: "cu.filmsociety" },
		interestNames: [INTEREST.art],
		facultyName: FACULTY.commArts,
		ownerContact: { name: "พี่จูน (ผู้ประสานงานกอง)", email: "cufilm.society@example.com" },
		averageHoursPerWeek: 7,
		recruitmentPeriod: { start: daysFromNow(-5), end: daysFromNow(28) },
	},
	{
		email: "demo.podcast@example.com",
		name: "ชมรมวิทยุสมัครเล่นและพอดแคสต์",
		imageLabel: "Podcast",
		bio: "ผลิตรายการเสียงของนิสิต ตั้งแต่จัดผังรายการจนถึงมิกซ์เสียงในห้องอัด",
		detailedDescription:
			"ชมรมดูแลรายการประจำสัปดาห์สามรายการ ครอบคลุมทั้งข่าวในมหาวิทยาลัย บทสัมภาษณ์ศิษย์เก่า และรายการเพลง สมาชิกจะได้ฝึกใช้ห้องอัดจริง ตั้งแต่การเซ็ตไมค์ไปจนถึงการมิกซ์และปล่อยตอนขึ้นแพลตฟอร์ม ใครสนใจงานเบื้องหลังล้วนก็สมัครฝ่ายเทคนิคได้",
		socials: { tiktok: "cu.podcast.club" },
		interestNames: [INTEREST.informatics, INTEREST.art],
		facultyName: FACULTY.commArts,
		ownerContact: { name: "พี่กิ๊ก (โปรดิวเซอร์)", phone: "086-313-4455" },
		averageHoursPerWeek: 6,
		recruitmentPeriod: { allYear: true },
	},
	{
		email: "demo.debate@example.com",
		name: "Chula Debate Club",
		imageLabel: "Debate",
		bio: "ชมรมโต้วาที ฝึกคิดเป็นระบบและพูดให้คนฟังคล้อยตามในเวลาจำกัด",
		detailedDescription:
			"เราซ้อมโต้วาทีรูปแบบ British Parliamentary ทุกสัปดาห์ พร้อมรับฟีดแบ็กจากกรรมการที่มีประสบการณ์แข่งระดับนานาชาติ ชมรมส่งทีมลงแข่งทั้งรายการภาษาไทยและภาษาอังกฤษ และเปิดคลาสพื้นฐานสำหรับคนที่ไม่เคยโต้วาทีมาก่อนทุกต้นภาคการศึกษา",
		socials: { facebook: "chula.debate" },
		interestNames: [INTEREST.education],
		facultyName: FACULTY.commArts,
		ownerContact: { name: "พี่นิว (หัวหน้าทีม)", line: "@chuladebate" },
		averageHoursPerWeek: 5,
		recruitmentPeriod: { start: daysFromNow(-12), end: daysFromNow(20) },
	},
	{
		email: "demo.entrepreneurs@example.com",
		name: "Chula Entrepreneurs",
		imageLabel: "CUENT",
		bio: "ชมรมธุรกิจและการลงทุน จัดทอล์ก Networking และพิตช์เดย์ตลอดปี",
		detailedDescription:
			"ชมรมเชื่อมนิสิตที่อยากเริ่มธุรกิจเข้ากับผู้ก่อตั้งและนักลงทุนตัวจริง กิจกรรมหลักคือทอล์กประจำเดือน คลาสอ่านงบการเงิน และพิตช์เดย์ปลายภาคที่เปิดให้ทีมนิสิตนำเสนอไอเดียต่อกรรมการภายนอก ทีมที่ผ่านรอบสุดท้ายจะได้เมนเทอร์ประกบต่ออีกหนึ่งภาคการศึกษา",
		socials: { instagram: "chula.entrepreneurs" },
		interestNames: [INTEREST.business, INTEREST.tech, INTEREST.education],
		facultyName: FACULTY.commerce,
		ownerContact: { name: "พี่เกม (ประธานชมรม)", email: "chula.ent@example.com" },
		averageHoursPerWeek: 6,
		recruitmentPeriod: { allYear: true },
		posts: [
			{
				title: "Startup Pitch Night",
				description: "เวทีพิตช์ไอเดียสตาร์ทอัพให้นักลงทุนและเมนเทอร์ในวงการ ได้ฟีดแบ็กแบบเรียลไทม์",
				activityTypeName: ACTIVITY.networking,
				interestNames: [INTEREST.business, INTEREST.tech],
				daysUntilDeadline: 18,
				imageLabel: "Pitch",
			},
		],
	},
	{
		email: "demo.investment@example.com",
		name: "CU Investment Club",
		imageLabel: "CUInvest",
		bio: "ชมรมการลงทุน วิเคราะห์หุ้นรายตัวและบริหารพอร์ตจำลองร่วมกันทุกสัปดาห์",
		detailedDescription:
			"สมาชิกแบ่งกลุ่มตามกลุ่มอุตสาหกรรมและนำเสนอบทวิเคราะห์หุ้นรายตัวสัปดาห์ละครั้ง ชมรมบริหารพอร์ตจำลองร่วมกันและทบทวนผลตอบแทนทุกสิ้นภาค เราเน้นกระบวนการวิเคราะห์และการบริหารความเสี่ยงมากกว่าการเดาทิศทางตลาดระยะสั้น",
		socials: { line: "@cuinvestment" },
		interestNames: [INTEREST.business],
		facultyName: FACULTY.commerce,
		ownerContact: { name: "พี่ภูมิ (ฝ่ายวิเคราะห์)", phone: "084-556-7788" },
		averageHoursPerWeek: 4,
		recruitmentPeriod: { start: daysFromNow(-18), end: daysFromNow(15) },
	},
	{
		email: "demo.marketing@example.com",
		name: "Chula Marketing Society",
		imageLabel: "CUMkt",
		bio: "ชมรมการตลาด ลงแข่งเคสจริงจากแบรนด์และผลิตแคมเปญให้ลูกค้าในมหาวิทยาลัย",
		detailedDescription:
			"เรารับโจทย์จริงจากแบรนด์และหน่วยงานภายในมหาวิทยาลัยมาทำเป็นแคมเปญเต็มรูปแบบ ตั้งแต่วิจัยผู้บริโภค วางกลยุทธ์ ไปจนถึงผลิตชิ้นงานสื่อสาร สมาชิกที่สนใจสายประกวดยังได้รวมทีมลงแข่งรายการเคสคอมเพททิชันระดับประเทศร่วมกับรุ่นพี่ด้วย",
		socials: { instagram: "chula.marketing" },
		interestNames: [INTEREST.business, INTEREST.art],
		facultyName: FACULTY.commerce,
		ownerContact: { name: "พี่แนน (ครีเอทีฟลีด)", email: "chula.mkt@example.com" },
		averageHoursPerWeek: 7,
		recruitmentPeriod: { start: daysFromNow(-8), end: daysFromNow(35) },
	},
	{
		email: "demo.literature@example.com",
		name: "ชมรมวรรณศิลป์จุฬาฯ",
		imageLabel: "Litera",
		bio: "ชมรมนักเขียน จัดวงอ่านงานและออกวารสารวรรณกรรมของนิสิตปีละสองเล่ม",
		detailedDescription:
			"เรามีวงอ่านงานทุกสองสัปดาห์ที่สมาชิกนำงานเขียนของตัวเองมาให้เพื่อนร่วมวิจารณ์อย่างตรงไปตรงมา ผลงานที่ผ่านการขัดเกลาจะถูกคัดลงวารสารของชมรมซึ่งออกปีละสองเล่ม นอกจากนี้ยังมีวงเสวนากับนักเขียนรับเชิญภาคละหนึ่งครั้ง",
		socials: { facebook: "chula.literature" },
		interestNames: [INTEREST.art],
		facultyName: FACULTY.arts,
		ownerContact: { name: "พี่ปราง (บรรณาธิการ)", line: "@culitera" },
		averageHoursPerWeek: 3,
		recruitmentPeriod: { allYear: true },
	},
	{
		email: "demo.japanese@example.com",
		name: "CU Japanese Culture Club",
		imageLabel: "CUJapan",
		bio: "ชมรมวัฒนธรรมญี่ปุ่น ทั้งภาษา อาหาร ดนตรี และงานเทศกาลประจำปี",
		detailedDescription:
			"กิจกรรมของชมรมครอบคลุมตั้งแต่คลาสสนทนาภาษาญี่ปุ่นระดับต้น เวิร์กช็อปทำอาหาร ไปจนถึงวงดนตรีที่เล่นเพลงญี่ปุ่นในงานเทศกาลประจำปี งานใหญ่ที่สุดคือเทศกาลปลายภาคที่เปิดให้คนนอกเข้าชม ซึ่งสมาชิกทุกคนมีส่วนร่วมในการจัด",
		socials: { tiktok: "cu.japanclub" },
		interestNames: [INTEREST.art, INTEREST.music],
		facultyName: FACULTY.arts,
		ownerContact: { name: "พี่มายด์ (ฝ่ายกิจกรรม)", phone: "087-660-3344" },
		averageHoursPerWeek: 5,
		recruitmentPeriod: { start: daysFromNow(-15), end: daysFromNow(22) },
	},
	{
		email: "demo.music@example.com",
		name: "Chula Music Club",
		imageLabel: "Music",
		bio: "ชุมชนคนรักดนตรี ทั้งร้อง เล่น และโปรดิวซ์ เปิดรับทุกคณะ",
		detailedDescription:
			"ชมรมมีห้องซ้อมและอุปกรณ์ครบสำหรับวงเต็ม สมาชิกจับวงกันเองได้อิสระและมีเวทีให้ขึ้นเล่นทุกเดือนผ่านกิจกรรม Open Mic สำหรับคนที่สนใจสายโปรดิวซ์ ชมรมเปิดคลาสสอนทำเพลงในคอมพิวเตอร์และมีห้องอัดขนาดเล็กให้จองใช้งาน",
		socials: { instagram: "chula.music" },
		interestNames: [INTEREST.music, INTEREST.art],
		facultyName: FACULTY.fineArts,
		ownerContact: { name: "พี่ปันปัน (ประธานชมรม)", email: "chula.music@example.com" },
		averageHoursPerWeek: 6,
		recruitmentPeriod: { allYear: true },
		posts: [
			{
				title: "Open Mic Night",
				description: "คืนเปิดไมค์สำหรับนักดนตรีและนักร้องสมัครเล่น ลงทะเบียนแสดงได้สูงสุด 3 เพลง",
				activityTypeName: ACTIVITY.performance,
				interestNames: [INTEREST.music],
				daysUntilDeadline: 7,
				imageLabel: "OpenMic",
			},
		],
	},
	{
		email: "demo.drama@example.com",
		name: "ชมรมนาฏศิลป์และการละคร",
		imageLabel: "Drama",
		bio: "ชมรมการแสดง ผลิตละครเวทีประจำปีและสอนนาฏศิลป์ไทยให้ผู้เริ่มต้น",
		detailedDescription:
			"งานหลักของชมรมคือละครเวทีประจำปีที่เปิดแสดงสามรอบช่วงปลายภาคปลาย นอกจากนักแสดง เรายังต้องการทีมฉาก ทีมแสงสี และทีมเครื่องแต่งกายจำนวนมาก ระหว่างปีมีคลาสนาฏศิลป์ไทยและคลาสการแสดงพื้นฐานเปิดให้สมาชิกเรียนฟรี",
		socials: { tiktok: "cu.dramaclub" },
		interestNames: [INTEREST.art, INTEREST.music],
		facultyName: FACULTY.fineArts,
		ownerContact: { name: "พี่ข้าวหอม (ผู้กำกับ)", line: "@cudrama" },
		averageHoursPerWeek: 9,
		recruitmentPeriod: { start: daysFromNow(-6), end: daysFromNow(26) },
	},
	{
		email: "demo.sports@example.com",
		name: "CU Sports Society",
		imageLabel: "CUSport",
		bio: "ชมรมกีฬาหลากหลายชนิด เน้นสุขภาพและมิตรภาพข้ามคณะ",
		detailedDescription:
			"ชมรมดูแลกีฬาหลายชนิดภายใต้ร่มเดียวกัน ทั้งฟุตบอล บาสเกตบอล แบดมินตัน และวอลเลย์บอล สมาชิกเลือกลงกีฬาได้มากกว่าหนึ่งชนิดและมีตารางซ้อมประจำสัปดาห์ที่ชัดเจน งานใหญ่ประจำปีคือทัวร์นาเมนต์ระหว่างคณะที่ชมรมเป็นเจ้าภาพจัด",
		socials: { instagram: "cu.sports" },
		interestNames: [INTEREST.sports],
		facultyName: FACULTY.sportsScience,
		ownerContact: { name: "พี่เอิร์ธ (ผู้จัดการทีม)", phone: "085-778-9900" },
		averageHoursPerWeek: 8,
		recruitmentPeriod: { allYear: true },
		posts: [
			{
				title: "Inter-Faculty Football Cup",
				description: "ทัวร์นาเมนต์ฟุตบอลระหว่างคณะ สมัครเป็นทีม 7 คนขึ้นไป",
				activityTypeName: ACTIVITY.sports,
				interestNames: [INTEREST.sports],
				daysUntilDeadline: 14,
				imageLabel: "Football",
			},
		],
	},
	{
		email: "demo.running@example.com",
		name: "ชมรมวิ่งจุฬาฯ",
		imageLabel: "CURun",
		// Tagged แพทย์ but never says it in the name or bio — the interest-only search case.
		bio: "ซ้อมวิ่งด้วยกันทุกเช้าวันเสาร์ และจัดงานวิ่งการกุศลประจำปีในมหาวิทยาลัย",
		detailedDescription:
			"เราซ้อมร่วมกันทุกเช้าวันเสาร์โดยแบ่งกลุ่มตามระยะและความเร็ว มีโค้ชอาสาช่วยดูฟอร์มการวิ่งและวางโปรแกรมซ้อมให้สมาชิกที่เตรียมลงงานแข่ง งานประจำปีของชมรมคืองานวิ่งการกุศลที่รายได้ทั้งหมดมอบให้โรงพยาบาลในเครือมหาวิทยาลัย",
		socials: { facebook: "cu.running.club" },
		interestNames: [INTEREST.sports, INTEREST.community, INTEREST.medical],
		facultyName: FACULTY.sportsScience,
		ownerContact: { name: "พี่หมิว (ประธานชมรม)", email: "cu.running@example.com" },
		averageHoursPerWeek: 4,
		recruitmentPeriod: { allYear: true },
	},
	{
		email: "demo.medvolunteer@example.com",
		name: "CU Medical Volunteer",
		imageLabel: "CUMed",
		bio: "ออกหน่วยแพทย์เคลื่อนที่และให้ความรู้สุขภาพแก่ชุมชนรอบมหาวิทยาลัย",
		detailedDescription:
			"ชมรมออกหน่วยร่วมกับอาจารย์แพทย์และพยาบาลเดือนละครั้ง ให้บริการตรวจสุขภาพเบื้องต้นและให้ความรู้เรื่องโรคเรื้อรังแก่ชุมชน สมาชิกที่ไม่ได้เรียนสายสุขภาพก็ช่วยงานลงทะเบียน งานสื่อสาร และงานประสานชุมชนได้ ทุกคนต้องผ่านการอบรมความปลอดภัยก่อนออกหน่วยครั้งแรก",
		socials: { instagram: "cu.medvolunteer" },
		interestNames: [INTEREST.medical, INTEREST.community],
		facultyName: FACULTY.medicine,
		ownerContact: { name: "พี่แอน (ฝ่ายประสานงาน)", line: "@cumedvol" },
		averageHoursPerWeek: 6,
		recruitmentPeriod: { start: daysFromNow(-22), end: daysFromNow(16) },
		posts: [
			{
				title: "หน่วยแพทย์เคลื่อนที่ชุมชนคลองเตย",
				description: "ออกหน่วยตรวจสุขภาพเบื้องต้นร่วมกับอาจารย์แพทย์ รับอาสาสมัคร 30 คน",
				activityTypeName: ACTIVITY.volunteer,
				interestNames: [INTEREST.medical, INTEREST.community],
				daysUntilDeadline: 25,
				imageLabel: "MedUnit",
			},
			{
				title: "Blood Donation Drive",
				description: "ร่วมบริจาคโลหิตกับสภากาชาดไทย จุดรับบริจาคที่ตึกอักษร ชั้น 1",
				activityTypeName: ACTIVITY.other,
				interestNames: [INTEREST.medical, INTEREST.community],
				daysUntilDeadline: 5,
				imageLabel: "Blood",
			},
		],
	},
	{
		email: "demo.firstaid@example.com",
		name: "ชมรมปฐมพยาบาลและกู้ชีพ",
		imageLabel: "FirstAid",
		bio: "อบรมการช่วยฟื้นคืนชีพและดูแลจุดปฐมพยาบาลในงานกิจกรรมของมหาวิทยาลัย",
		detailedDescription:
			"สมาชิกทุกคนผ่านการอบรมการช่วยฟื้นคืนชีพและการใช้เครื่องกระตุกหัวใจไฟฟ้าจากวิทยากรที่ได้รับการรับรอง ชมรมรับหน้าที่ดูแลจุดปฐมพยาบาลในงานกีฬาและงานเทศกาลของมหาวิทยาลัย และเปิดคลาสอบรมให้นิสิตทั่วไปฟรีภาคละสองรอบ",
		socials: { instagram: "cu.firstaid" },
		interestNames: [INTEREST.medical, INTEREST.education],
		facultyName: FACULTY.medicine,
		ownerContact: { name: "พี่บีม (หัวหน้าชุดกู้ชีพ)", phone: "088-121-3141" },
		averageHoursPerWeek: 5,
		recruitmentPeriod: { start: daysFromNow(-9), end: daysFromNow(24) },
	},
	{
		email: "demo.mun@example.com",
		name: "CU Model United Nations",
		imageLabel: "CUMUN",
		bio: "จำลองการประชุมสหประชาชาติ ฝึกเจรจาและร่างข้อมติเป็นภาษาอังกฤษ",
		detailedDescription:
			"ชมรมจัดการประชุมจำลองภายในภาคละหนึ่งครั้ง และส่งผู้แทนไปร่วมงานของมหาวิทยาลัยอื่นตลอดปี สมาชิกจะได้ฝึกค้นคว้าจุดยืนของประเทศที่ได้รับมอบหมาย เขียนเอกสารแสดงจุดยืน และเจรจาหาเสียงสนับสนุนในห้องประชุมจริง มีคลาสปูพื้นฐานให้ผู้ที่ไม่เคยเข้าร่วมมาก่อน",
		socials: { instagram: "cu.mun" },
		interestNames: [INTEREST.education, INTEREST.business],
		facultyName: FACULTY.politicalScience,
		ownerContact: { name: "พี่ฟิล์ม (เลขาธิการ)", email: "cumun.sg@example.com" },
		averageHoursPerWeek: 6,
		recruitmentPeriod: { start: daysFromNow(-11), end: daysFromNow(19) },
	},
	{
		email: "demo.educamp@example.com",
		name: "ชมรมค่ายอาสาพัฒนาการศึกษา",
		imageLabel: "EduCamp",
		bio: "จัดค่ายติวและกิจกรรมการเรียนรู้ให้โรงเรียนขยายโอกาสในต่างจังหวัด",
		detailedDescription:
			"ทุกปิดภาคเราออกค่ายไปจัดกิจกรรมการเรียนรู้ให้นักเรียนมัธยมต้นในโรงเรียนขยายโอกาส ทั้งค่ายติววิชาหลักและกิจกรรมแนะแนวการศึกษาต่อ สมาชิกจะได้ออกแบบแผนการสอนเองและซ้อมสอนกับรุ่นพี่ก่อนลงพื้นที่จริงทุกครั้ง",
		socials: { facebook: "cu.educamp" },
		interestNames: [INTEREST.education, INTEREST.community],
		facultyName: FACULTY.education,
		ownerContact: { name: "พี่ตาล (ประธานค่าย)", line: "@cueducamp" },
		averageHoursPerWeek: 7,
		recruitmentPeriod: { start: daysFromNow(-28), end: daysFromNow(10) },
	},
	{
		email: "demo.urbansketch@example.com",
		name: "Chula Urban Sketchers",
		imageLabel: "Sketch",
		// Sole Architecture club, and "architecture" appears in no name or bio — the faculty-only search case.
		bio: "ออกไปวาดรูปนอกสถานที่ทุกสุดสัปดาห์ บันทึกเมืองและย่านเก่าด้วยลายเส้น",
		detailedDescription:
			"ทุกสุดสัปดาห์เรานัดกันไปวาดรูปตามย่านเก่าและพื้นที่สาธารณะในกรุงเทพฯ ไม่มีการสอนแบบเป็นทางการ แต่ทุกคนจะได้ดูวิธีทำงานของกันและกันและแลกเปลี่ยนเทคนิคหลังจบรอบ ผลงานตลอดปีถูกรวบรวมจัดนิทรรศการเล็กในมหาวิทยาลัยช่วงปลายภาคปลาย",
		socials: { tiktok: "chula.urbansketch" },
		interestNames: [INTEREST.art, INTEREST.community],
		facultyName: FACULTY.architecture,
		ownerContact: { name: "พี่กร (ผู้ดูแลกลุ่ม)", email: "chula.sketch@example.com" },
		averageHoursPerWeek: 4,
		recruitmentPeriod: { allYear: true },
	},

	// ─── Negative cases: both rows exist so /clubs can be proven to exclude them. ───
	{
		email: "demo.suspended@example.com",
		name: "CU Suspended Club (ต้องไม่ขึ้นในหน้า /clubs)",
		imageLabel: "Banned",
		bio: "ชมรมนี้ถูกระงับ ใช้ทดสอบว่าหน้า /clubs กรอง isBanned ออกจริง หากเห็นการ์ดนี้แปลว่าตัวกรองพัง",
		detailedDescription:
			"เรกคอร์ดนี้มีไว้ทดสอบอย่างเดียว ตั้งค่า isBanned เป็น true เพื่อยืนยันว่ารายการชมรมกรองบัญชีที่ถูกระงับออกก่อนแสดงผล",
		socials: { instagram: "cu.suspended.demo" },
		interestNames: [INTEREST.tech],
		facultyName: FACULTY.engineering,
		ownerContact: { name: "ระบบทดสอบ", email: "suspended.demo@example.com" },
		averageHoursPerWeek: 1,
		recruitmentPeriod: { allYear: false },
		isBanned: true,
	},
	{
		email: "demo.openhouse@example.com",
		name: "Chula Open House 2026 (ต้องไม่ขึ้นในหน้า /clubs)",
		imageLabel: "Event",
		bio: "องค์กรประเภท EVENT ใช้ทดสอบว่าหน้า /clubs กรองเฉพาะ category CLUB หากเห็นการ์ดนี้แปลว่าตัวกรองพัง",
		detailedDescription:
			"เรกคอร์ดนี้มีไว้ทดสอบอย่างเดียว ตั้งค่า category เป็น EVENT เพื่อยืนยันว่ารายการชมรมแสดงเฉพาะองค์กรประเภท CLUB",
		socials: { facebook: "chula.openhouse.demo" },
		interestNames: [INTEREST.education],
		facultyName: FACULTY.economics,
		ownerContact: { name: "ระบบทดสอบ", phone: "02-000-0000" },
		averageHoursPerWeek: 1,
		recruitmentPeriod: { start: daysFromNow(0), end: daysFromNow(60) },
		category: "EVENT",
	},
];

const attendee = {
	email: "demo.attendee@example.com",
	name: "Demo Attendee",
	facultyName: FACULTY.economics,
	interestNames: [INTEREST.tech, INTEREST.business, INTEREST.music],
};

function placeholderImage(label: string, w = 400, h = 500) {
	return `https://placehold.co/${w}x${h}/DE5C8E/FFFFFF/png?text=${encodeURIComponent(label)}`;
}

function requireId(map: Map<string, string>, name: string, kind: string) {
	const id = map.get(name);
	if (!id) {
		throw new Error(`Missing ${kind} "${name}". Run \`yarn db:seed\` first, then re-run this script.`);
	}
	return id;
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
	}

	if (opts.interestIds) {
		await db.delete(interestXUser).where(eq(interestXUser.userId, userId));
		if (opts.interestIds.length > 0) {
			await db.insert(interestXUser).values(
				opts.interestIds.map((interestId) => ({
					userId,
					interestId,
				})),
			);
		}
	}

	return { userId, created: !existing };
}

type Lookups = {
	facultyByName: Map<string, string>;
	interestByName: Map<string, string>;
	activityByName: Map<string, string>;
};

async function seedClub(club: ClubSeed, lookups: Lookups) {
	const facultyId = requireId(lookups.facultyByName, club.facultyName, "faculty");
	const interestIds = club.interestNames.map((name) => requireId(lookups.interestByName, name, "interest"));

	const { userId, created } = await ensureUser({
		email: club.email,
		name: club.name,
		role: "ORGANIZATION",
		facultyId,
	});

	const values = {
		name: club.name,
		facultyId,
		category: club.category ?? ("CLUB" as const),
		averageHoursPerWeek: club.averageHoursPerWeek,
		bio: club.bio,
		detailedDescription: club.detailedDescription,
		// Form Q8 — real uploads land later, so every club seeds an empty gallery.
		gallery: [],
		recruitmentPeriod: club.recruitmentPeriod,
		isBanned: club.isBanned ?? false,
		image: placeholderImage(club.imageLabel, 200, 200),
		ownerContact: club.ownerContact,
		socials: club.socials,
	};

	const existingOrg = await db.query.organization.findFirst({
		where: eq(organization.userId, userId),
		columns: { id: true },
	});

	let orgId: string;
	if (existingOrg) {
		orgId = existingOrg.id;
		await db.update(organization).set(values).where(eq(organization.id, orgId));
	} else {
		orgId = randomUUID();
		await db.insert(organization).values({ ...values, id: orgId, userId });
	}

	await db.delete(interestXOrganization).where(eq(interestXOrganization.organizationId, orgId));
	if (interestIds.length > 0) {
		await db.insert(interestXOrganization).values(
			interestIds.map((interestId) => ({
				interestId,
				organizationId: orgId,
			})),
		);
	}

	const existingPostIds = (await db.select({ id: post.id }).from(post).where(eq(post.organizationId, orgId))).map(
		(row) => row.id,
	);
	if (existingPostIds.length > 0) {
		// interest_x_post has no ON DELETE CASCADE, so its rows have to go first.
		// calendar_item and event_reminder_delivery do cascade — a re-run drops saved demo events.
		await db.delete(interestXPost).where(inArray(interestXPost.postId, existingPostIds));
		await db.delete(post).where(inArray(post.id, existingPostIds));
	}

	const instaLink = club.socials.instagram ? `https://instagram.com/${club.socials.instagram}` : null;
	for (const p of club.posts ?? []) {
		const postId = randomUUID();
		await db.insert(post).values({
			id: postId,
			organizationId: orgId,
			activityTypeId: requireId(lookups.activityByName, p.activityTypeName, "activity type"),
			title: p.title,
			description: p.description,
			instaLink,
			image: placeholderImage(p.imageLabel),
			date: daysFromNow(p.daysUntilDeadline),
		});

		if (p.interestNames.length > 0) {
			await db.insert(interestXPost).values(
				p.interestNames.map((name) => ({
					interestId: requireId(lookups.interestByName, name, "interest"),
					postId,
				})),
			);
		}
	}

	const flag = club.isBanned ? " [banned]" : club.category === "EVENT" ? " [event]" : "";
	console.log(
		`  ${created ? "+" : "~"} ${club.name}${flag} — ${club.facultyName}, ${club.interestNames.length} interest(s), ${club.posts?.length ?? 0} post(s)`,
	);
}

/** Mirrors the client-side matcher in src/app/(attendee)/clubs/page.tsx so the printed hints stay honest. */
function matchesSearch(club: ClubSeed, needle: string) {
	const term = needle.trim().toLowerCase();
	if (!term) return true;
	return (
		club.name.toLowerCase().includes(term) ||
		club.bio.toLowerCase().includes(term) ||
		club.facultyName.toLowerCase().includes(term) ||
		club.interestNames.some((name) => name.toLowerCase().includes(term))
	);
}

function pagesFor(count: number) {
	const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
	return `${count} club(s) → ${pages} page(s)`;
}

function printHints(visible: ClubSeed[], facultyTotal: number) {
	const byFaculty = new Map<string, number>();
	const byInterest = new Map<string, number>();
	for (const club of visible) {
		byFaculty.set(club.facultyName, (byFaculty.get(club.facultyName) ?? 0) + 1);
		for (const name of club.interestNames) {
			byInterest.set(name, (byInterest.get(name) ?? 0) + 1);
		}
	}

	const lastPageSize = visible.length % PAGE_SIZE || PAGE_SIZE;
	const searchCount = (needle: string) => visible.filter((club) => matchesSearch(club, needle)).length;
	const facultyCount = (name: string) => byFaculty.get(name) ?? 0;
	const interestCount = (name: string) => byInterest.get(name) ?? 0;

	console.log(`\n─── What to try on /clubs (PAGE_SIZE = ${PAGE_SIZE}) ───`);
	console.log(`Pagination   ${pagesFor(visible.length)}, last page holds ${lastPageSize}`);
	console.log(`Faculty      "${FACULTY.engineering}" → ${pagesFor(facultyCount(FACULTY.engineering))}`);
	console.log(`             "${FACULTY.architecture}" → ${pagesFor(facultyCount(FACULTY.architecture))}`);
	console.log(`Interest     "${INTEREST.tech}" → ${pagesFor(interestCount(INTEREST.tech))}`);
	console.log(`             "${INTEREST.medical}" → ${pagesFor(interestCount(INTEREST.medical))}`);
	console.log(`Search       "CU" → ${pagesFor(searchCount("CU"))}`);
	console.log(`             "ชมรม" → ${pagesFor(searchCount("ชมรม"))}`);
	console.log(`             "โซลาร์เซลล์" → ${searchCount("โซลาร์เซลล์")} club(s), matches bio only`);
	console.log(`             "Architecture" → ${searchCount("Architecture")} club(s), matches faculty name only`);
	console.log(
		`             "${INTEREST.medical}" → ${searchCount(INTEREST.medical)} club(s), ชมรมวิ่งจุฬาฯ matches by interest only`,
	);
	console.log(`             "zzz" → ${searchCount("zzz")} club(s), empty state`);
	console.log(`Combine      faculty "${FACULTY.medicine}" + interest "${INTEREST.music}" → empty state`);
	console.log(`Reset        jump to the last page, then type in search — it should snap back to page 1`);
	console.log(
		`Empty        ${facultyTotal - byFaculty.size} of ${facultyTotal} faculties have no clubs, so most faculty filters go empty`,
	);
}

async function main() {
	console.log("Seeding final demo data (clubs, posts, demo accounts)...\n");

	const [faculties, interests, activityTypes] = await Promise.all([
		db.select().from(faculty),
		db.select().from(interest),
		db.select().from(activityType),
	]);

	if (faculties.length === 0 || interests.length === 0 || activityTypes.length === 0) {
		throw new Error("Missing base seed data. Run `yarn db:seed` first, then `yarn db:seed:demo:final`.");
	}

	const lookups: Lookups = {
		facultyByName: new Map(faculties.map((row) => [row.name, row.id])),
		interestByName: new Map(interests.map((row) => [row.name, row.id])),
		activityByName: new Map(activityTypes.map((row) => [row.name, row.id])),
	};

	// Fail before writing anything if the club data references a name the base seed does not have.
	for (const club of clubs) {
		requireId(lookups.facultyByName, club.facultyName, "faculty");
		club.interestNames.forEach((name) => requireId(lookups.interestByName, name, "interest"));
		club.posts?.forEach((p) => {
			requireId(lookups.activityByName, p.activityTypeName, "activity type");
			p.interestNames.forEach((name) => requireId(lookups.interestByName, name, "interest"));
		});
	}
	requireId(lookups.facultyByName, attendee.facultyName, "faculty");
	attendee.interestNames.forEach((name) => requireId(lookups.interestByName, name, "interest"));

	console.log("Attendee");
	const { created } = await ensureUser({
		email: attendee.email,
		name: attendee.name,
		role: "ATTENDEE",
		facultyId: requireId(lookups.facultyByName, attendee.facultyName, "faculty"),
		interestIds: attendee.interestNames.map((name) => requireId(lookups.interestByName, name, "interest")),
	});
	console.log(`  ${created ? "+" : "~"} ${attendee.name} — ${attendee.email}\n`);

	console.log("Organizations");
	for (const club of clubs) {
		await seedClub(club, lookups);
	}

	const visible = clubs.filter((club) => (club.category ?? "CLUB") === "CLUB" && !club.isBanned);
	const hidden = clubs.filter((club) => !visible.includes(club));
	const postCount = clubs.reduce((sum, club) => sum + (club.posts?.length ?? 0), 0);
	const clubsWithPosts = clubs.filter((club) => (club.posts?.length ?? 0) > 0).length;

	console.log(
		`\nSeeded ${clubs.length} organization account(s): ${visible.length} visible, ${hidden.length} hidden.`,
	);
	console.log(`Seeded ${postCount} post(s) across ${clubsWithPosts} club(s).`);

	console.log(`\n─── Login (password for every account: ${DEMO_PASSWORD}) ───`);
	console.log(`Attendee   ${attendee.email}`);
	console.log(`Clubs      ${visible[0]!.email} … and ${visible.length - 1} more, all demo.<slug>@example.com`);
	for (const club of hidden) {
		const why = club.isBanned ? "isBanned = true" : `category = ${club.category}`;
		console.log(`Hidden     ${club.email.padEnd(32)} ${why} → must NOT appear on /clubs`);
	}

	printHints(visible, faculties.length);
	console.log("");
}

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
