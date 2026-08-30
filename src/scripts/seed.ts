import "dotenv/config";
import { db } from "@/server/db";
import { affiliations } from "@/server/db/schema/affiliations";
import { categories } from "@/server/db/schema/categories";

const affiliationLabels = [
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

const categorySeeds = [
  { label: "การศึกษา", fontColor: "#475569", backgroundColor: "#E2E8F0" },
  { label: "กีฬา", fontColor: "#EA580C", backgroundColor: "#FFEDD5" },
  { label: "การเงิน", fontColor: "#059669", backgroundColor: "#D1FAE5" },
  { label: "เกม", fontColor: "#7C3AED", backgroundColor: "#EDE9FE" },
  { label: "จิตอาสา", fontColor: "#0D9488", backgroundColor: "#CCFBF1" },
  { label: "ดนตรี", fontColor: "#DC2626", backgroundColor: "#FEE2E2" },
  { label: "เทคโนโลยี", fontColor: "#0891B2", backgroundColor: "#CFFAFE" },
  { label: "ธุรกิจ", fontColor: "#9333EA", backgroundColor: "#F3E8FF" },
  { label: "พัฒนาตนเอง", fontColor: "#4F46E5", backgroundColor: "#E0E7FF" },
  { label: "ภาษาและวัฒนธรรม", fontColor: "#E11D48", backgroundColor: "#FFE4E6" },
  { label: "วิชาการ", fontColor: "#2563EB", backgroundColor: "#DBEAFE" },
  { label: "ไลฟ์สไตล์", fontColor: "#0284C7", backgroundColor: "#E0F2FE" },
  { label: "ศิลปะ", fontColor: "#DB2777", backgroundColor: "#FCE7F3" },
  { label: "สายอาชีพ", fontColor: "#D97706", backgroundColor: "#FEF3C7" },
  { label: "สิ่งแวดล้อม", fontColor: "#16A34A", backgroundColor: "#DCFCE7" },
  { label: "สุขภาพ", fontColor: "#65A30D", backgroundColor: "#ECFCCB" },
  { label: "ความบันเทิง", fontColor: "#C026D3", backgroundColor: "#FAE8FF" },
];

const thCollator = new Intl.Collator("th");
const byLabel = <T extends { label: string }>(a: T, b: T) => thCollator.compare(a.label, b.label);

async function seedAffiliations() {
  console.log("Seeding affiliations...");

  const sorted = [...affiliationLabels].map((label) => ({ label })).sort(byLabel);

  await db.insert(affiliations).values(sorted).onConflictDoNothing({ target: affiliations.label });

  console.log(`Seeded ${sorted.length} affiliations.`);
}

async function seedCategories() {
  console.log("Seeding categories...");

  const sorted = [...categorySeeds].sort(byLabel);

  await db.insert(categories).values(sorted).onConflictDoNothing({ target: categories.label });

  console.log(`Seeded ${sorted.length} categories.`);
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
