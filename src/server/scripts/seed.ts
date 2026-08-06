import "dotenv/config";
import { randomUUID, randomBytes } from "crypto";
import { eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { faculties } from "@/server/db/schema/faculties";
import { categories } from "@/server/db/schema/categories";
import { invitationCodes } from "@/server/db/schema/invitation-codes";
import { clubs } from "@/server/db/schema/clubs";
import { clubCategories } from "@/server/db/schema/club-categories";
import { account, session, user, verification } from "@/server/db/schema/auth-schema";
import { auth } from "@/utils/auth";

const facultyNames = [
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

const categorySeeds = [
  { label: "เทคโนโลยี", fontColor: "#1D4ED8", backgroundColor: "#DBEAFE" },
  { label: "ธุรกิจ", fontColor: "#B45309", backgroundColor: "#FEF3C7" },
  { label: "ศิลปะ", fontColor: "#7C3AED", backgroundColor: "#EDE9FE" },
  { label: "ดนตรี", fontColor: "#BE185D", backgroundColor: "#FCE7F3" },
  { label: "กีฬา", fontColor: "#047857", backgroundColor: "#D1FAE5" },
  { label: "พัฒนาชุมชน", fontColor: "#B91C1C", backgroundColor: "#FEE2E2" },
  { label: "วิชาการ", fontColor: "#1E3A8A", backgroundColor: "#E0E7FF" },
] as const;

type SeedUser = {
  email: string;
  name: string;
  username: string;
  role: "ATTENDEE" | "ADMIN";
  facultyName: (typeof facultyNames)[number];
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
    email: "seed.admin@example.com",
    name: "System Administrator",
    username: "system.admin",
    role: "ADMIN",
    facultyName: "Science",
    password: "Seed1234!",
  },
];

type ClubSeed = {
  email: string;
  name: string;
  facultyName: (typeof facultyNames)[number];
  categoryLabels: Array<(typeof categorySeeds)[number]["label"]>;
  shortDescription: string;
  longDescription: string;
  logoUrl: string;
  imageUrls: string[];
  contacts: { instagram?: string; facebook?: string; tiktok?: string; line_oa?: string };
  password: string;
};

const clubsToSeed: ClubSeed[] = [
  {
    email: "seed.club.innovation@example.com",
    name: "Chula Innovation Network",
    facultyName: "Engineering",
    categoryLabels: ["เทคโนโลยี", "ธุรกิจ"],
    shortDescription: "ชมรมสตาร์ทอัพและนวัตกรรมที่ช่วยให้นิสิตพัฒนาโซลูชันจริง",
    longDescription:
      "เราจัดกิจกรรมที่ผสมผสานระหว่างเทคโนโลยี การออกแบบผลิตภัณฑ์ และการคิดเชิงธุรกิจ ผ่าน Hackathon, Design Sprint และ Product Clinic ที่มี mentor จากนักพัฒนาจริง",
    logoUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&q=80",
    imageUrls: ["https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"],
    contacts: { instagram: "chula.innovation", facebook: "ChulaInnovationNetwork" },
    password: "Seed1234!",
  },
  {
    email: "seed.club.music@example.com",
    name: "The Sound Lab",
    facultyName: "Arts",
    categoryLabels: ["ดนตรี", "ศิลปะ"],
    shortDescription: "คอมมูนิตี้นักดนตรีและครีเอทีฟที่เปิดพื้นที่ให้ลองสร้างเสียงใหม่ ๆ",
    longDescription:
      "The Sound Lab จัด Open Mic, studio sessions และ workshop ให้สมาชิกได้ฝึกซ้อมและสร้างผลงานร่วมกันอย่างใกล้ชิด",
    logoUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=200&q=80",
    imageUrls: ["https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80"],
    contacts: { instagram: "thesoundlab.cu", tiktok: "thesoundlab.th" },
    password: "Seed1234!",
  },
];

async function resetSeedData() {
  await db.transaction(async (tx) => {
    await tx.delete(clubCategories).where(sql`true`);
    await tx.delete(clubs).where(sql`true`);
    await tx.delete(invitationCodes).where(sql`true`);
    await tx.delete(session).where(sql`true`);
    await tx.delete(account).where(sql`true`);
    await tx.delete(verification).where(sql`true`);
    await tx.delete(user).where(sql`true`);
    await tx.delete(categories).where(sql`true`);
    await tx.delete(faculties).where(sql`true`);
  });
}

async function seedBaseData() {
  await db.transaction(async (tx) => {
    for (const name of facultyNames) {
      await tx.insert(faculties).values({ label: name });
    }

    for (const categorySeed of categorySeeds) {
      await tx.insert(categories).values(categorySeed);
    }
  });
}

async function seedUsers() {
  const facultyRows = await db.select({ id: faculties.id, name: faculties.label }).from(faculties);
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
        emailVerified: true,
        role: seedUser.role,
      })
      .where(eq(user.id, result.user.id));

    console.log(`Seeded user: ${seedUser.email}`);
  }
}

async function seedClubs() {
  const facultiesRows = await db.select({ id: faculties.id, label: faculties.label }).from(faculties);
  const facultyByLabel = new Map(facultiesRows.map((row) => [row.label, row.id]));
  const categoryRows = await db.select({ id: categories.id, label: categories.label }).from(categories);
  const categoryByLabel = new Map(categoryRows.map((row) => [row.label, row.id]));

  for (const clubSeed of clubsToSeed) {
    const result = await auth.api.signUpEmail({
      body: {
        email: clubSeed.email,
        password: clubSeed.password,
        name: clubSeed.name,
        role: "CLUB",
      },
    });
    const userId = result.user.id;
    await db.update(user).set({ role: "CLUB", emailVerified: true }).where(eq(user.id, userId));

    const clubId = randomUUID();
    await db.insert(clubs).values({
      id: clubId,
      userId,
      email: clubSeed.email,
      registrationStatus: "COMPLETED",
      name: clubSeed.name,
      logoUrl: clubSeed.logoUrl,
      facultyId: facultyByLabel.get(clubSeed.facultyName) ?? null,
      shortDescription: clubSeed.shortDescription,
      longDescription: clubSeed.longDescription,
      imageUrls: clubSeed.imageUrls,
      contacts: clubSeed.contacts,
    });

    const categoryIds = clubSeed.categoryLabels
      .map((label) => categoryByLabel.get(label))
      .filter((id): id is number => id !== undefined);
    if (categoryIds.length > 0) {
      await db.insert(clubCategories).values(categoryIds.map((categoryId) => ({ clubId, categoryId })));
    }

    console.log(`Seeded club: ${clubSeed.name}`);
  }
}

async function seedInvitationCodes() {
  const expiredAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const pendingInvites = ["seed.club.pending@example.com"];

  for (const email of pendingInvites) {
    const inviteCode = randomBytes(6).toString("hex").toUpperCase();
    await db.insert(invitationCodes).values({
      id: randomUUID(),
      email,
      inviteCode,
      expiredAt,
    });
    console.log(`Issued invitation code for ${email}: ${inviteCode}`);
  }
}

async function main() {
  console.log("Resetting and seeding base data, users, and clubs...");
  await resetSeedData();
  await seedBaseData();
  await seedUsers();
  await seedClubs();
  await seedInvitationCodes();
  console.log("Seeding completed.");
  console.log("Login credentials:");
  for (const userData of usersToSeed) {
    console.log(`- ${userData.email} / ${userData.password}`);
  }
  for (const clubData of clubsToSeed) {
    console.log(`- ${clubData.email} / ${clubData.password}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
