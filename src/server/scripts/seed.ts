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

// Ported from branch `refactor` (src/scripts/seed.ts `affiliationLabels`).
const faculties = [
  "เกษตรศาสตร์บูรณาการ",
  "ครุศาสตร์",
  "จิตวิทยา",
  "ทันตแพทยศาสตร์",
  "นิติศาสตร์",
  "นิเทศศาสตร์",
  "ฝ่ายกีฬา อบจ.",
  "ฝ่ายพัฒนาสังคมและบำเพ็ญประโยชน์ อบจ.",
  "ฝ่ายวิชาการ อบจ.",
  "ฝ่ายศิลปะวัฒนธรรม อบจ.",
  "พยาบาลศาสตร์",
  "เภสัชศาสตร์",
  "รัฐศาสตร์",
  "วิทยาศาสตร์",
  "วิทยาศาสตร์การกีฬา",
  "วิศวกรรมศาสตร์",
  "ศิลปกรรมศาสตร์",
  "เศรษฐศาสตร์",
  "สถาบันนวัตกรรมบูรณาการ",
  "สถาปัตยกรรมศาสตร์",
  "สหเวชศาสตร์",
  "สัตวแพทยศาสตร์",
  "อักษรศาสตร์",
  "CU Innovation Hub",
] as const;

// Names match branch `refactor`'s `categorySeeds` labels — see interest-theme.ts for the color mapping.
const interests = [
  { name: "ธุรกิจ", icon: "BriefcaseBusiness" },
  { name: "เทคโนโลยี", icon: "Cpu" },
  { name: "แพทย์", icon: "HeartPulse" },
  { name: "กีฬา", icon: "Volleyball" },
  { name: "พัฒนาชุมชน", icon: "HandHeart" },
  { name: "วิชาการ", icon: "BookOpen" },
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
    facultyName: "วิศวกรรมศาสตร์",
    password: "Seed1234!",
  },
  {
    email: "seed.organizer@example.com",
    name: "Nara Pattanakul",
    username: "nara.pattanakul",
    role: "ORGANIZATION",
    facultyName: "วิศวกรรมศาสตร์",
    password: "Seed1234!",
  },
  {
    email: "seed.music@example.com",
    name: "Mina Siriporn",
    username: "mina.siriporn",
    role: "ORGANIZATION",
    facultyName: "อักษรศาสตร์",
    password: "Seed1234!",
  },
  {
    email: "seed.entrepreneur@example.com",
    name: "Preecha Rattanakul",
    username: "preecha.rattanakul",
    role: "ORGANIZATION",
    facultyName: "เศรษฐศาสตร์",
    password: "Seed1234!",
  },
  {
    email: "seed.sports@example.com",
    name: "Korn Chaiyaporn",
    username: "korn.chaiyaporn",
    role: "ORGANIZATION",
    facultyName: "วิทยาศาสตร์การกีฬา",
    password: "Seed1234!",
  },
  {
    email: "seed.admin@example.com",
    name: "System Administrator",
    username: "system.admin",
    role: "ADMIN",
    facultyName: "วิทยาศาสตร์",
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
      managerEmails: ["seed.organizer@example.com", "seed.music@example.com"],
      name: "Chula Innovation Network",
      facultyName: "วิศวกรรมศาสตร์",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80",
      bio: "ชมรมสตาร์ทอัพและนวัตกรรมบน campus ที่ช่วยให้นิสิตพัฒนาโซลูชันจริงสำหรับปัญหาชุมชน โดยเน้นการทำงานแบบทีมและการส่งมอบผลงานที่ใช้งานได้",
      detailedDescription:
        "เราจัดกิจกรรมที่ผสมผสานระหว่างการพัฒนาเทคโนโลยี การออกแบบผลิตภัณฑ์ และการคิดเชิงธุรกิจ เพื่อให้สมาชิกได้เรียนรู้การสร้างผลงานจากแนวคิดสู่การใช้งานจริง ผ่านโปรเจกต์ในรูปแบบ Hackathon, Design Sprint, และ Product Clinic ที่มี mentor จากนักพัฒนาจริงและผู้เชี่ยวชาญในวงการ",
      gallery: [
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
      ],
      socials: {
        signUpForm: "https://example.com/forms/chula-innovation",
        discord: "discord.gg/chula-innovation",
        instagram: "chula.innovation",
        facebook: "ChulaInnovationNetwork",
        tiktok: "chula.inno.official",
        line: "@chulainno",
      },
      averageHoursPerWeek: 8,
      recruitmentPeriod: { allYear: false, start: new Date("2026-08-01"), end: new Date("2026-12-15") },
      interestNames: ["เทคโนโลยี", "ธุรกิจ", "พัฒนาชุมชน"],
      posts: [
        {
          title: "Hackathon for Good 2026",
          description: "แข่งขันสร้างสรรค์โปรเจกต์เพื่อชุมชนใน 48 ชั่วโมง พร้อมเวิร์กช็อปเตรียมตัวและรับ feedback จาก mentor จริง",
          activityTypeName: "การแข่งขัน",
          interestNames: ["เทคโนโลยี", "พัฒนาชุมชน"],
          dateOffsetDays: 18,
          image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=700&q=80",
        },
        {
          title: "Product Design Sprint",
          description: "เวิร์กช็อปออกแบบผลิตภัณฑ์สำหรับผู้เริ่มต้น พร้อมกรณีศึกษาและการนำเสนอให้กับผู้มีส่วนได้ส่วนเสีย",
          activityTypeName: "วอร์คชอป / อบรม",
          interestNames: ["เทคโนโลยี", "ศิลปะ"],
          dateOffsetDays: 36,
          image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=700&q=80",
        },
      ],
    },
    {
      managerEmails: ["seed.music@example.com", "seed.organizer@example.com"],
      name: "The Sound Lab",
      facultyName: "อักษรศาสตร์",
      image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&q=80",
      bio: "คอมมูนิตี้นักดนตรีและครีเอทีฟที่เปิดพื้นที่ให้สมาชิกลองสร้างเสียงใหม่ ๆ ผ่านการแสดงสด การบันทึกเสียง และการทำงานร่วมกับศิลปินในวงการ",
      detailedDescription:
        "The Sound Lab เป็นพื้นที่สำหรับคนที่รักเสียงเพลงและครีเอทีฟที่อยากลองพัฒนาทักษะการแสดง การเรียบเรียงเพลง และการสร้างคอนเทนต์ด้วยตัวเอง เราจัด Open Mic, studio sessions, และ workshop ที่ให้สมาชิกได้ฝึกซ้อมและสร้างผลงานร่วมกันอย่างใกล้ชิด",
      gallery: [
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
        "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&q=80",
        "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80",
      ],
      socials: {
        signUpForm: "https://example.com/forms/the-sound-lab",
        discord: "discord.gg/soundlab",
        instagram: "thesoundlab.cu",
        facebook: "TheSoundLabCU",
        tiktok: "thesoundlab.th",
        line: "@thesoundlab",
      },
      averageHoursPerWeek: 6,
      recruitmentPeriod: { allYear: true },
      interestNames: ["ดนตรี", "ศิลปะ", "การศึกษา"],
      posts: [
        {
          title: "Open Mic Night",
          description: "คืนแสดงสดสำหรับนักร้องและนักดนตรีสมัครเล่น โดยมีพื้นที่ให้แสดง 3 เพลงต่อทีม พร้อมการถ่ายภาพและอัปโหลดคลิปสั้นหลังงาน",
          activityTypeName: "คอนเสิร์ต / การแสดง",
          interestNames: ["ดนตรี", "ศิลปะ"],
          dateOffsetDays: 6,
          image: "https://images.unsplash.com/photo-1470229722913-7c090be32205?w=700&q=80",
        },
        {
          title: "Studio Session & Songwriting Clinic",
          description: "เวิร์กช็อปการเรียบเรียงเพลงและการบันทึกเสียงสำหรับผู้เริ่มต้นที่อยากสร้างผลงานจริง",
          activityTypeName: "วอร์คชอป / อบรม",
          interestNames: ["ดนตรี", "การศึกษา"],
          dateOffsetDays: 24,
          image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=700&q=80",
        },
      ],
    },
    {
      managerEmails: ["seed.entrepreneur@example.com"],
      name: "Catalyst Collective",
      facultyName: "เศรษฐศาสตร์",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80",
      bio: "ชมรมผู้ประกอบการและนักธุรกิจรุ่นเยาว์ที่ช่วยให้นิสิตฝึกคิดเชิงกลยุทธ์และนำไอเดียสู่โมเดลธุรกิจที่จับต้องได้",
      detailedDescription:
        "Catalyst Collective จัดวงสนทนาและโครงการสำหรับคนที่อยากเรียนรู้เรื่อง startup, finance, และ product-market fit ผ่านเวที pitch night, workshop, และ mentor circle ที่เปิดโอกาสให้สมาชิกได้สร้างความสัมพันธ์กับนักธุรกิจและผู้ประกอบการในพื้นที่",
      gallery: [
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80",
      ],
      socials: {
        signUpForm: "https://example.com/forms/catalyst-collective",
        instagram: "catalyst.collective",
        facebook: "CatalystCollectiveCU",
        line: "@catalystcu",
      },
      averageHoursPerWeek: 10,
      recruitmentPeriod: { allYear: false, start: new Date("2026-09-01"), end: new Date("2026-11-30") },
      interestNames: ["ธุรกิจ", "เทคโนโลยี", "การศึกษา"],
      posts: [
        {
          title: "Startup Pitch Night",
          description: "เวทีพิตช์ไอเดียธุรกิจแบบเรียลไทม์ พร้อม feedback จากผู้เชี่ยวชาญและเครือข่ายนักลงทุน",
          activityTypeName: "Networking",
          interestNames: ["ธุรกิจ", "เทคโนโลยี"],
          dateOffsetDays: 14,
          image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=700&q=80",
        },
        {
          title: "Finance 101 Seminar",
          description: "สัมมนาเรื่องการจัดการเงินและทักษะการตัดสินใจทางการเงินสำหรับนักศึกษาในช่วงเริ่มต้น",
          activityTypeName: "สัมมนา / บรรยาย",
          interestNames: ["ธุรกิจ", "การศึกษา"],
          dateOffsetDays: 27,
          image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=700&q=80",
        },
      ],
    },
    {
      managerEmails: ["seed.sports@example.com"],
      name: "Pulse Athletics",
      facultyName: "วิทยาศาสตร์การกีฬา",
      image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80",
      bio: "ชมรมกีฬาและสุขภาพที่ส่งเสริมการออกกำลังกายเป็นกิจกรรมกลุ่มและสร้างบรรยากาศการมีส่วนร่วมในคณะและชุมชน",
      detailedDescription:
        "Pulse Athletics เชิญชวนคนรักกีฬาและสุขภาพทุกระดับฝีมือเข้าร่วมกิจกรรมฝึกซ้อม, การแข่งขันภายในคณะ, และโครงการสุขภาพเชิงชุมชน เราให้ความสำคัญกับทั้งการพัฒนาทักษะและการสร้างความสัมพันธ์ที่ดีจากการทำกิจกรรมร่วมกัน",
      gallery: [
        "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80",
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
      ],
      socials: {
        signUpForm: "https://example.com/forms/pulse-athletics",
        instagram: "pulse.athletics",
        facebook: "PulseAthleticsCU",
        line: "@pulseathletics",
      },
      averageHoursPerWeek: 7,
      recruitmentPeriod: { allYear: true },
      interestNames: ["กีฬา", "พัฒนาชุมชน"],
      posts: [
        {
          title: "Inter-Faculty Football Cup",
          description: "ทัวร์นาเมนต์ฟุตบอลระหว่างคณะสำหรับทีม 7 คนขึ้นไป พร้อมกิจกรรม networking หลังแข่งขัน",
          activityTypeName: "กิจกรรมกีฬา",
          interestNames: ["กีฬา"],
          dateOffsetDays: 12,
          image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=700&q=80",
        },
        {
          title: "Weekend Run Club",
          description: "กิจกรรมวิ่งเพื่อสุขภาพและสร้างแรงบันดาลใจในช่วงเช้า พร้อมการแบ่งกลุ่มตามระดับความเร็ว",
          activityTypeName: "กิจกรรมกีฬา",
          interestNames: ["กีฬา"],
          dateOffsetDays: 22,
          image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=700&q=80",
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
    const managerUsers = await Promise.all(
      organizationSeed.managerEmails.map(async (email) => {
        const existingUser = await db.query.user.findFirst({ where: eq(user.email, email) });
        if (!existingUser) {
          throw new Error(`Manager user ${email} was not found.`);
        }
        return existingUser;
      }),
    );

    const organizationId = randomUUID();
    await db.insert(organization).values({
      id: organizationId,
      name: organizationSeed.name,
      facultyId: facultyByName.get(organizationSeed.facultyName) ?? null,
      category: "CLUB",
      averageHoursPerWeek: organizationSeed.averageHoursPerWeek,
      bio: organizationSeed.bio,
      detailedDescription: organizationSeed.detailedDescription,
      gallery: organizationSeed.gallery,
      recruitmentPeriod: organizationSeed.recruitmentPeriod,
      userId: managerUsers[0]!.id,
      isBanned: false,
      image: organizationSeed.image,
      ownerContact: {
        name: organizationSeed.name,
        email: managerUsers[0]!.email,
        phone: "+66 81 234 5678",
        line: `@${organizationSeed.name.toLowerCase().replace(/\s+/g, "")}`,
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
        instaLink: `https://instagram.com/${organizationSeed.socials.instagram ?? "club"}`,
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

    for (const managerUser of managerUsers) {
      await db.insert(userXOrganization).values({
        userId: managerUser.id,
        organizationId,
      });
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
      createdOrganizationIds.slice(0, 3).map((organizationId) => ({
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