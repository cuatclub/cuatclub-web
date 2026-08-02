import "dotenv/config";
import { randomUUID } from "crypto";
import { eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { activityType } from "@/server/db/activityType";
import { faculty } from "@/server/db/faculty";
import { interest } from "@/server/db/interest";
import { account, session, user, verification } from "@/server/db/auth-schema";
import { calendarItem } from "@/server/db/calendarItem";
import { eventReminderDelivery } from "@/server/db/eventReminderDelivery";
import { interestXOrganization } from "@/server/db/interestXOrganization";
import { interestXPost } from "@/server/db/interestXPost";
import { interestXUser } from "@/server/db/interestXUser";
import { organization } from "@/server/db/organization";
import { post } from "@/server/db/post";
import { userXOrganization } from "@/server/db/userXOrganization";
import { auth } from "@/utils/auth";

const faculties = [
  "Allied Health Sciences",
  "Architecture",
  "Arts",
  "Commerce and Accountancy",
  "Communication Arts",
  "Dentistry",
  "Economics",
  "Education",
  "Engineering",
  "Fine and Applied Arts",
  "Laws",
  "Medicine",
  "Nursing",
  "Pharmaceutical Sciences",
  "Political Science",
  "Psychology",
  "Science",
  "Sports Science",
  "Veterinary Science",
  "School of Integrated Innovation",
  "Agricultural Resources",
  "Graduate School",
] as const;

const interests = [
  { name: "ธุรกิจ", icon: "BriefcaseBusiness" },
  { name: "เทคโนโลยี", icon: "Cpu" },
  { name: "แพทย์", icon: "HeartPulse" },
  { name: "กีฬา", icon: "Volleyball" },
  { name: "พัฒนาชุมชน", icon: "HandHeart" },
  { name: "สารสนเทศ", icon: "Monitor" },
  { name: "ศิลปะ", icon: "Palette" },
  { name: "ดนตรี", icon: "Music" },
  { name: "การศึกษา", icon: "GraduationCap" },
] as const;

const activityTypes = [
  "สัมมนา / บรรยาย",
  "วอร์คชอป / อบรม",
  "การแข่งขัน",
  "นิทรรศการ / งานแสดง",
  "คอนเสิร์ต / การแสดง",
  "กิจกรรมอาสา / ชุมชน",
  "Networking",
  "กิจกรรมกีฬา",
  "งานเปิดรับสมัคร / รับสมาชิก",
  "อื่นๆ",
] as const;

type SeedUser = {
  email: string;
  name: string;
  username: string;
  role: "ATTENDEE" | "ORGANIZATION" | "ADMIN";
  facultyName: (typeof faculties)[number];
  password: string;
};

const usersToSeed: SeedUser[] = [
  {
    email: "seed.attendee@example.com",
    name: "Alicia Chen",
    username: "alicia.chen",
    role: "ATTENDEE",
    facultyName: "Engineering",
    password: "Seed1234!",
  },
  {
    email: "seed.organization@example.com",
    name: "Chula Innovation Club",
    username: "chula.innovation",
    role: "ORGANIZATION",
    facultyName: "Engineering",
    password: "Seed1234!",
  },
  {
    email: "seed.music@example.com",
    name: "Music Society Admin",
    username: "music.society",
    role: "ORGANIZATION",
    facultyName: "Arts",
    password: "Seed1234!",
  },
  {
    email: "seed.admin@example.com",
    name: "System Administrator",
    username: "system.admin",
    role: "ADMIN",
    facultyName: "Science",
    password: "Seed1234!",
  },
];

async function resetSeedData() {
  await db.transaction(async (tx) => {
    await tx.delete(interestXUser).where(sql`true`);
    await tx.delete(interestXOrganization).where(sql`true`);
    await tx.delete(interestXPost).where(sql`true`);
    await tx.delete(userXOrganization).where(sql`true`);
    await tx.delete(calendarItem).where(sql`true`);
    await tx.delete(eventReminderDelivery).where(sql`true`);
    await tx.delete(session).where(sql`true`);
    await tx.delete(account).where(sql`true`);
    await tx.delete(verification).where(sql`true`);
    await tx.delete(post).where(sql`true`);
    await tx.delete(organization).where(sql`true`);
    await tx.delete(user).where(sql`true`);
    await tx.delete(interest).where(sql`true`);
    await tx.delete(activityType).where(sql`true`);
    await tx.delete(faculty).where(sql`true`);
  });
}

async function seedBaseData() {
  await db.transaction(async (tx) => {
    for (const name of faculties) {
      await tx.insert(faculty).values({ id: randomUUID(), name });
    }

    for (const name of activityTypes) {
      await tx.insert(activityType).values({ id: randomUUID(), name });
    }

    for (const item of interests) {
      await tx.insert(interest).values({ id: randomUUID(), name: item.name, icon: item.icon });
    }
  });
}

async function seedUsers() {
  const facultyRows = await db.select({ id: faculty.id, name: faculty.name }).from(faculty);
  const facultyByName = new Map(facultyRows.map((row) => [row.name, row.id]));

  for (const seedUser of usersToSeed) {
    const result = await auth.api.signUpEmail({
      body: {
        email: seedUser.email,
        password: seedUser.password,
        name: seedUser.name,
        role: seedUser.role,
      },
    });

    await db
      .update(user)
      .set({
        username: seedUser.username,
        facultyId: facultyByName.get(seedUser.facultyName) ?? null,
        onboardingComplete: true,
        isReceiveMail: true,
        notifyEventReminders: true,
        notifyMatchingEvents: true,
        notifyClubUpdates: true,
        emailVerified: true,
        role: seedUser.role,
      })
      .where(eq(user.id, result.user.id));

    console.log(`Seeded user: ${seedUser.email}`);
  }
}

async function seedOrganizationsAndContent() {
  const facultyRows = await db.select({ id: faculty.id, name: faculty.name }).from(faculty);
  const facultyByName = new Map(facultyRows.map((row) => [row.name, row.id]));
  const interestRows = await db.select({ id: interest.id, name: interest.name }).from(interest);
  const interestByName = new Map(interestRows.map((row) => [row.name, row.id]));
  const activityRows = await db.select({ id: activityType.id, name: activityType.name }).from(activityType);
  const activityByName = new Map(activityRows.map((row) => [row.name, row.id]));

  const organizationSeeds = [
    {
      userEmail: "seed.organization@example.com",
      name: "Chula Innovation Club",
      facultyName: "Engineering",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80",
      bio: "ชมรมเทคโนโลยีที่มุ่งเน้นการสร้างนวัตกรรมและโปรเจกต์เพื่อสังคม เราเป็นพื้นที่สำหรับนิสิตที่อยากลงมือทำจริงและพัฒนาทักษะแบบก้าวกระโดดในสายอาชีพแห่งอนาคต เช่น สาย Development, UI/UX Design, และ Product Management",
      detailedDescription:
        "เปิดรับสมัครนิสิตทุกชั้นปี ทุกคณะ ที่มีความสนใจอยากท้าทายตัวเองด้วยการลงมือทำโปรเจกต์จริง ไม่จำเป็นต้องมีประสบการณ์มาก่อน ขอแค่มีใจรักในการเรียนรู้! ในชมรมของเรา คุณจะได้เรียนรู้กระบวนการทำงานแบบ Agile และ Scrum อย่างเต็มรูปแบบ ฝึกฝนกระบวนการคิดในการออกแบบ UX/UI ที่ตอบโจทย์การใช้งานจริง สัมผัสประสบการณ์การพัฒนาซอฟต์แวร์ และการสื่อสารเพื่อนำเสนองานกับผู้มีส่วนได้ส่วนเสีย (Stakeholders) เพื่อสร้างสรรค์ผลิตภัณฑ์ที่นำไปสู่การเปลี่ยนแปลงที่ดีในสังคม",
      gallery: [
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80"
      ],
      socials: {
        signUpForm: "https://example.com/forms/chula-innovation",
        discord: "discord.gg/chula-innovation",
        instagram: "chula.innovation",
        facebook: "ChulaInnovationClub",
        tiktok: "chula.inno.official",
        line: "@chulainno",
      },
      interestNames: ["เทคโนโลยี", "ธุรกิจ", "พัฒนาชุมชน"],
      posts: [
        {
          title: "Hackathon for Good 2026",
          description: "แข่งขันสร้างสรรค์โปรเจกต์เพื่อชุมชนใน 48 ชั่วโมง พร้อมเวิร์กช็อปและรางวัลสำหรับทีมชนะ",
          activityTypeName: "การแข่งขัน",
          interestNames: ["เทคโนโลยี", "พัฒนาชุมชน"],
          dateOffsetDays: 18,
          image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=700&q=80",
        },
        {
          title: "Product Design Workshop",
          description: "เวิร์กช็อปออกแบบผลิตภัณฑ์สำหรับผู้เริ่มต้น พร้อมตัวอย่างจากโครงการจริง",
          activityTypeName: "วอร์คชอป / อบรม",
          interestNames: ["เทคโนโลยี", "ศิลปะ"],
          dateOffsetDays: 40,
          image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=700&q=80",
        },
      ],
    },
    {
      userEmail: "seed.music@example.com",
      name: "Music Society",
      facultyName: "Arts",
      image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&q=80",
      bio: "ชุมชนคนรักเสียงดนตรีและศิลปะแห่งการแสดง เราเปิดพื้นที่อิสระให้นักร้อง นักดนตรี และผู้ชื่นชอบเสียงเพลงได้มาปลดปล่อยความเป็นตัวเองแบบไม่จำกัดแนวเพลงและความสามารถ",
      detailedDescription:
        "เราเป็นคลับที่รวบรวมคนหลงใหลในเสียงดนตรีไว้ด้วยกัน! ตลอดปีการศึกษา เราจัดกิจกรรมที่หลากหลายเพื่อซัพพอร์ตแพสชันของทุกคน ตั้งแต่คอนเสิร์ต Open Mic ประจำเดือนที่เปิดโอกาสให้คุณก้าวขึ้นเวทีไปโชว์ของ, เวิร์กช็อปพัฒนาทักษะด้านการแสดงและการเรียบเรียงดนตรีจากศิลปินมืออาชีพ, ไปจนถึงกิจกรรม Music Networking ที่ช่วยให้คุณได้จับคู่หาเพื่อนร่วมวงที่เคมีตรงกัน มาสัมผัสประสบการณ์แห่งความสุขและสร้างสรรค์ผลงานเพลงไปด้วยกันในคอมมูนิตี้ที่อบอุ่นที่สุด",
      gallery: [
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
        "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&q=80"
      ],
      socials: {
        signUpForm: "https://example.com/forms/music-society",
        discord: "discord.gg/music-society",
        instagram: "music.society",
        facebook: "MusicSocietyCU",
        tiktok: "musicsociety.th",
        line: "@musicsociety",
      },
      interestNames: ["ดนตรี", "ศิลปะ", "การศึกษา"],
      posts: [
        {
          title: "Open Mic Night",
          description: "คืนแสดงสดสำหรับนักร้องและนักดนตรีสมัครเล่น โดยมีพื้นที่ให้แสดง 3 เพลงต่อทีม",
          activityTypeName: "คอนเสิร์ต / การแสดง",
          interestNames: ["ดนตรี", "ศิลปะ"],
          dateOffsetDays: 6,
          image: "https://images.unsplash.com/photo-1470229722913-7c090be32205?w=700&q=80",
        },
        {
          title: "Band Workshop",
          description: "เวิร์กช็อปการบรรเลงและการเรียบเรียงเพลงสำหรับผู้เริ่มต้น",
          activityTypeName: "วอร์คชอป / อบรม",
          interestNames: ["ดนตรี", "การศึกษา"],
          dateOffsetDays: 25,
          image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=700&q=80",
        },
      ],
    },
  ];

  const attendeeUser = await db.query.user.findFirst({ where: eq(user.email, "seed.attendee@example.com") });
  if (!attendeeUser) {
    throw new Error("Attendee user was not found for relationship seeding.");
  }

  const createdOrganizationIds: string[] = [];
  const createdPostIds: string[] = [];

  for (const organizationSeed of organizationSeeds) {
    const ownerUser = await db.query.user.findFirst({ where: eq(user.email, organizationSeed.userEmail) });
    if (!ownerUser) {
      throw new Error(`Owner user ${organizationSeed.userEmail} was not found.`);
    }

    const organizationId = randomUUID();
    await db.insert(organization).values({
      id: organizationId,
      name: organizationSeed.name,
      facultyId: facultyByName.get(organizationSeed.facultyName) ?? null,
      category: "CLUB",
      averageHoursPerWeek: 8,
      bio: organizationSeed.bio,
      detailedDescription: organizationSeed.detailedDescription,
      gallery: organizationSeed.gallery,
      recruitmentPeriod: { allYear: true },
      userId: ownerUser.id,
      isBanned: false,
      image: organizationSeed.image,
      ownerContact: {
        name: organizationSeed.name,
        email: ownerUser.email,
      },
      socials: organizationSeed.socials,
    });
    createdOrganizationIds.push(organizationId);

    const orgInterestIds = organizationSeed.interestNames
      .map((interestName) => interestByName.get(interestName))
      .filter((interestId): interestId is string => Boolean(interestId));
    if (orgInterestIds.length > 0) {
      await db.insert(interestXOrganization).values(
        orgInterestIds.map((interestId) => ({
          interestId,
          organizationId,
        })),
      );
    }

    for (const postSeed of organizationSeed.posts) {
      const activityTypeId = activityByName.get(postSeed.activityTypeName);
      if (!activityTypeId) {
        continue;
      }

      const postId = randomUUID();
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + postSeed.dateOffsetDays);
      eventDate.setHours(19, 0, 0, 0);

      await db.insert(post).values({
        id: postId,
        organizationId,
        activityTypeId,
        title: postSeed.title,
        description: postSeed.description,
        instaLink: `https://instagram.com/${organizationSeed.socials.instagram}`,
        image: postSeed.image,
        date: eventDate,
      });
      createdPostIds.push(postId);

      const postInterestIds = postSeed.interestNames
        .map((interestName) => interestByName.get(interestName))
        .filter((interestId): interestId is string => Boolean(interestId));
      if (postInterestIds.length > 0) {
        await db.insert(interestXPost).values(
          postInterestIds.map((interestId) => ({
            interestId,
            postId,
          })),
        );
      }
    }
  }

  const attendeeInterestIds = ["เทคโนโลยี", "ดนตรี", "การศึกษา"]
    .map((interestName) => interestByName.get(interestName))
    .filter((interestId): interestId is string => Boolean(interestId));
  if (attendeeInterestIds.length > 0) {
    await db.delete(interestXUser).where(eq(interestXUser.userId, attendeeUser.id));
    await db.insert(interestXUser).values(
      attendeeInterestIds.map((interestId) => ({
        userId: attendeeUser.id,
        interestId,
      })),
    );
  }

  if (createdOrganizationIds.length > 0) {
    await db.delete(userXOrganization).where(eq(userXOrganization.userId, attendeeUser.id));
    await db.insert(userXOrganization).values(
      createdOrganizationIds.map((organizationId) => ({
        userId: attendeeUser.id,
        organizationId,
      })),
    );
  }

  if (createdPostIds.length >= 2) {
    await db.insert(calendarItem).values([
      {
        id: randomUUID(),
        userId: attendeeUser.id,
        postId: createdPostIds[0]!,
      },
      {
        id: randomUUID(),
        userId: attendeeUser.id,
        postId: createdPostIds[1]!,
      },
    ]);

    await db.insert(eventReminderDelivery).values({
      userId: attendeeUser.id,
      postId: createdPostIds[0]!,
      claimedAt: new Date(),
      sentAt: new Date(),
    });
  }

  console.log("Seeded organizations, posts, and relationships.");
}

async function main() {
  console.log("Resetting and seeding base data and users...");
  await resetSeedData();
  await seedBaseData();
  await seedUsers();
  await seedOrganizationsAndContent();
  console.log("Seeding completed.");
  console.log("Login credentials:");
  for (const userData of usersToSeed) {
    console.log(`- ${userData.email} / ${userData.password}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });