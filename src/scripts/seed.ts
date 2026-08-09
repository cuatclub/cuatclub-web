import "dotenv/config";
import { db } from "@/server/db";
import { affiliations } from "@/server/db/schema/affiliations";
import { categories } from "@/server/db/schema/categories";

const affiliationLabels = [
  "ครุศาสตร์",
  "จิตวิทยา",
  "ทันตแพทยศาสตร์",
  "นิติศาสตร์",
  "นิเทศศาสตร์",
  "เภสัชศาสตร์",
  "รัฐศาสตร์",
  "วิทยาศาสตร์",
  "วิทยาศาสตร์การกีฬา",
  "วิศวกรรมศาสตร์",
  "ศิลปกรรมศาสตร์",
  "เศรษฐศาสตร์",
  "สถาปัตยกรรมศาสตร์",
  "สหเวชศาสตร์",
  "สัตวแพทยศาสตร์",
  "อักษรศาสตร์",
  "เกษตรศาสตร์บูรณาการ",
  "สถาบันนวัตกรรมบูรณาการ",
  "พยาบาลศาสตร์",
  "ฝ่ายวิชาการ อบจ.",
  "ฝ่ายศิลปะวัฒนธรรม อบจ.",
  "ฝ่ายกีฬา อบจ.",
  "ฝ่ายพัฒนาสังคมและบำเพ็ญประโยชน์ อบจ.",
  "CU Innovation Hub",
] as const;

const categorySeeds = [
  { label: "ธุรกิจ", fontColor: "#9333EA", backgroundColor: "#F3E8FF" },
  { label: "เทคโนโลยี", fontColor: "#0891B2", backgroundColor: "#CFFAFE" },
  { label: "แพทย์", fontColor: "#CA8A24", backgroundColor: "#FEF9C3" },
  { label: "กีฬา", fontColor: "#EA580C", backgroundColor: "#FFEDD5" },
  { label: "วิชาการ", fontColor: "#2563EB", backgroundColor: "#DBEAFE" },
  { label: "พัฒนาชุมชน", fontColor: "#16A34A", backgroundColor: "#DCFCE7" },
  { label: "ศิลปะ", fontColor: "#DB2777", backgroundColor: "#FCE7F3" },
  { label: "ดนตรี", fontColor: "#DC2626", backgroundColor: "#FEE2E2" },
  { label: "การศึกษา", fontColor: "#475569", backgroundColor: "#E2E8F0" },
];

async function seedAffiliations() {
  console.log("Seeding affiliations...");

  await db
    .insert(affiliations)
    .values(affiliationLabels.map((label) => ({ label })))
    .onConflictDoNothing({ target: affiliations.label });

  console.log(`Seeded ${affiliationLabels.length} affiliations.`);
}

async function seedCategories() {
  console.log("Seeding categories...");

  await db
    .insert(categories)
    .values(categorySeeds)
    .onConflictDoNothing({ target: categories.label });

  console.log(`Seeded ${categorySeeds.length} categories.`);
}

async function main() {
  await seedAffiliations();
  await seedCategories();
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
