import "dotenv/config";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/server/db";
import {
  activities,
  activityCategories,
  activityFaculties,
  activityTypes,
  categories,
  clubs,
  faculties,
  user,
} from "@/server/db/schema";

/**
 * Demo activity posts for clubs created by `yarn db:seed:club`.
 * IDs are fixed so rerunning this script updates only these posts and preserves their links.
 * Application links and posters are placeholders, not real registration destinations.
 */
type ActivitySeed = {
  id: string;
  clubEmail: string;
  typeLabel: string;
  title: string;
  description: string;
  audience: (typeof activities.$inferInsert)["audience"];
  yearLevels: number[];
  categoryLabels: string[];
  facultyLabels: string[];
  startDayOffset: number;
  endDayOffset: number;
  slug: string;
};

const activitySeeds: ActivitySeed[] = [
  {
    id: "9b763462-0d95-4c69-9d3c-000000000001",
    clubEmail: "demo.thinc@example.com",
    typeLabel: "รับสมัคร",
    title: "Thinc Open House",
    description: "Meet the teams building student-led products and apply to join Thinc.",
    audience: "CHULA_STUDENT",
    yearLevels: [1, 2, 3, 4],
    categoryLabels: ["เทคโนโลยี", "ธุรกิจ"],
    facultyLabels: ["วิศวกรรมศาสตร์"],
    startDayOffset: -7,
    endDayOffset: 14,
    slug: "thinc-open-house",
  },
  {
    id: "9b763462-0d95-4c69-9d3c-000000000002",
    clubEmail: "demo.thinc@example.com",
    typeLabel: "เวิร์กช็อป",
    title: "Build a Product in a Weekend",
    description: "Work with a team to prototype, test, and pitch a useful campus product.",
    audience: "CHULA_STUDENT",
    yearLevels: [1, 2, 3, 4],
    categoryLabels: ["เทคโนโลยี", "พัฒนาตนเอง"],
    facultyLabels: [],
    startDayOffset: 5,
    endDayOffset: 25,
    slug: "thinc-product-weekend",
  },
  {
    id: "9b763462-0d95-4c69-9d3c-000000000003",
    clubEmail: "demo.robotics@example.com",
    typeLabel: "เวิร์กช็อป",
    title: "Robotics for Beginners",
    description: "Try sensors, motors, and a simple robot build with CU Robotics Club.",
    audience: "GENERAL_PUBLIC",
    yearLevels: [],
    categoryLabels: ["เทคโนโลยี", "การศึกษา"],
    facultyLabels: ["วิศวกรรมศาสตร์"],
    startDayOffset: 1,
    endDayOffset: 21,
    slug: "robotics-beginners",
  },
  {
    id: "9b763462-0d95-4c69-9d3c-000000000004",
    clubEmail: "demo.music@example.com",
    typeLabel: "เทศกาล",
    title: "Campus Music Night",
    description: "An evening of live sets from student bands and guest performers.",
    audience: "GENERAL_PUBLIC",
    yearLevels: [],
    categoryLabels: ["ดนตรี", "ความบันเทิง"],
    facultyLabels: [],
    startDayOffset: -2,
    endDayOffset: 16,
    slug: "campus-music-night",
  },
  {
    id: "9b763462-0d95-4c69-9d3c-000000000005",
    clubEmail: "demo.running@example.com",
    typeLabel: "การแข่งขัน",
    title: "Chula Fun Run",
    description: "A friendly campus run with short and long routes for all experience levels.",
    audience: "GENERAL_PUBLIC",
    yearLevels: [],
    categoryLabels: ["กีฬา", "สุขภาพ"],
    facultyLabels: ["วิทยาศาสตร์การกีฬา"],
    startDayOffset: 7,
    endDayOffset: 30,
    slug: "chula-fun-run",
  },
  {
    id: "9b763462-0d95-4c69-9d3c-000000000006",
    clubEmail: "demo.medvolunteer@example.com",
    typeLabel: "จิตอาสา",
    title: "Community Health Volunteer Day",
    description: "Support health education and community outreach alongside student volunteers.",
    audience: "CHULA_STUDENT",
    yearLevels: [2, 3, 4],
    categoryLabels: ["จิตอาสา", "สุขภาพ"],
    facultyLabels: ["พยาบาลศาสตร์"],
    startDayOffset: -3,
    endDayOffset: 12,
    slug: "community-health-volunteer",
  },
  {
    id: "9b763462-0d95-4c69-9d3c-000000000007",
    clubEmail: "demo.film@example.com",
    typeLabel: "การแสดง",
    title: "Student Film Screening",
    description: "Watch short films by student filmmakers and join the discussion afterward.",
    audience: "GENERAL_PUBLIC",
    yearLevels: [],
    categoryLabels: ["ศิลปะ", "ความบันเทิง"],
    facultyLabels: ["นิเทศศาสตร์"],
    startDayOffset: -35,
    endDayOffset: -2,
    slug: "student-film-screening",
  },
  {
    id: "9b763462-0d95-4c69-9d3c-000000000008",
    clubEmail: "demo.debate@example.com",
    typeLabel: "การแข่งขัน",
    title: "Chula Debate Open",
    description: "Compete in beginner-friendly debate rounds with feedback from mentors.",
    audience: "CHULA_STUDENT",
    yearLevels: [1, 2, 3, 4],
    categoryLabels: ["วิชาการ", "พัฒนาตนเอง"],
    facultyLabels: ["อักษรศาสตร์", "รัฐศาสตร์"],
    startDayOffset: 10,
    endDayOffset: 40,
    slug: "chula-debate-open",
  },
  {
    id: "9b763462-0d95-4c69-9d3c-000000000009",
    clubEmail: "demo.datascience@example.com",
    typeLabel: "ค่าย",
    title: "Data Science Bootcamp",
    description: "Learn data analysis and present a small project using real-world datasets.",
    audience: "CHULA_STUDENT",
    yearLevels: [1, 2, 3, 4],
    categoryLabels: ["เทคโนโลยี", "วิชาการ"],
    facultyLabels: ["วิทยาศาสตร์"],
    startDayOffset: -1,
    endDayOffset: 15,
    slug: "data-science-bootcamp",
  },
  {
    id: "9b763462-0d95-4c69-9d3c-000000000010",
    clubEmail: "demo.creativecode@example.com",
    typeLabel: "นิทรรศการ",
    title: "Creative Code Showcase",
    description: "Explore interactive art projects made with code by Chula students.",
    audience: "GENERAL_PUBLIC",
    yearLevels: [],
    categoryLabels: ["เทคโนโลยี", "ศิลปะ"],
    facultyLabels: ["วิศวกรรมศาสตร์", "ศิลปกรรมศาสตร์"],
    startDayOffset: 2,
    endDayOffset: 18,
    slug: "creative-code-showcase",
  },
  {
    id: "9b763462-0d95-4c69-9d3c-000000000011",
    clubEmail: "demo.entrepreneurs@example.com",
    typeLabel: "บรรยาย",
    title: "Startup Stories at Chula",
    description: "Hear from student founders about early customers, mistakes, and launches.",
    audience: "CHULA_STUDENT",
    yearLevels: [1, 2, 3, 4],
    categoryLabels: ["ธุรกิจ", "สายอาชีพ"],
    facultyLabels: ["เศรษฐศาสตร์"],
    startDayOffset: -4,
    endDayOffset: 20,
    slug: "startup-stories",
  },
  {
    id: "9b763462-0d95-4c69-9d3c-000000000012",
    clubEmail: "demo.boardgame@example.com",
    typeLabel: "ประชาสัมพันธ์",
    title: "Board Game Open Night",
    description: "Drop in for an evening of tabletop games; no previous experience needed.",
    audience: "GENERAL_PUBLIC",
    yearLevels: [],
    categoryLabels: ["เกม", "ไลฟ์สไตล์"],
    facultyLabels: [],
    startDayOffset: -8,
    endDayOffset: 8,
    slug: "board-game-open-night",
  },
];

function requireId(map: Map<string, number>, label: string, kind: string): number {
  const id = map.get(label);
  if (id === undefined) {
    throw new Error(`Missing ${kind} "${label}". Run \`yarn db:seed\` first.`);
  }
  return id;
}

function daysFrom(now: number, offset: number): Date {
  return new Date(now + offset * 24 * 60 * 60 * 1000);
}

function posterUrl(title: string): string {
  return `https://placehold.co/1200x675/2563EB/FFFFFF/png?text=${encodeURIComponent(title)}`;
}

async function main() {
  const clubEmails = [...new Set(activitySeeds.map((seed) => seed.clubEmail))];
  const [clubRows, typeRows, categoryRows, facultyRows] = await Promise.all([
    db
      .select({ id: clubs.id, email: user.email, status: clubs.registrationStatus })
      .from(clubs)
      .innerJoin(user, eq(clubs.userId, user.id))
      .where(inArray(user.email, clubEmails)),
    db.select().from(activityTypes),
    db.select().from(categories),
    db.select().from(faculties),
  ]);

  const clubsByEmail = new Map(clubRows.map((row) => [row.email, row]));
  const typesByLabel = new Map(typeRows.map((row) => [row.label, row.id]));
  const categoriesByLabel = new Map(categoryRows.map((row) => [row.label, row.id]));
  const facultiesByLabel = new Map(facultyRows.map((row) => [row.label, row.id]));
  const now = Date.now();

  // Resolve every reference before writing, so a missing prerequisite leaves the DB unchanged.
  const prepared = activitySeeds.map((seed) => {
    const club = clubsByEmail.get(seed.clubEmail);
    if (club?.status !== "COMPLETED") {
      throw new Error(
        `Missing completed demo club "${seed.clubEmail}". Run \`yarn db:seed:club\` first.`
      );
    }
    return {
      values: {
        id: seed.id,
        clubId: club.id,
        activityTypeId: requireId(typesByLabel, seed.typeLabel, "activity type"),
        title: seed.title,
        description: seed.description,
        posterUrl: posterUrl(seed.title),
        audience: seed.audience,
        yearLevels: seed.yearLevels,
        applicationFormUrl: `https://example.com/apply/${seed.slug}`,
        applicationStartAt: daysFrom(now, seed.startDayOffset),
        applicationEndAt: daysFrom(now, seed.endDayOffset),
      },
      categoryIds: seed.categoryLabels.map((label) =>
        requireId(categoriesByLabel, label, "category")
      ),
      facultyIds: seed.facultyLabels.map((label) => requireId(facultiesByLabel, label, "faculty")),
    };
  });

  await db.transaction(async (tx) => {
    for (const { values, categoryIds, facultyIds } of prepared) {
      const { id, ...updates } = values;
      await tx
        .insert(activities)
        .values(values)
        .onConflictDoUpdate({ target: activities.id, set: updates });

      await tx.delete(activityCategories).where(eq(activityCategories.activityId, id));
      if (categoryIds.length > 0) {
        await tx
          .insert(activityCategories)
          .values(categoryIds.map((categoryId) => ({ activityId: id, categoryId })));
      }

      await tx.delete(activityFaculties).where(eq(activityFaculties.activityId, id));
      if (facultyIds.length > 0) {
        await tx
          .insert(activityFaculties)
          .values(facultyIds.map((facultyId) => ({ activityId: id, facultyId })));
      }
    }
  });

  console.log(`Seeded ${prepared.length} demo activities across ${clubEmails.length} clubs.`);
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
