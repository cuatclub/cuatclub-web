import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { affiliations } from "@/server/db/schema/affiliations";
import { categories } from "@/server/db/schema/categories";
import { clubCategories } from "@/server/db/schema/club-categories";
import { clubs } from "@/server/db/schema/clubs";
import { user } from "@/server/db/schema/user";

/**
 * Demo clubs shaped so every control on /clubs (issue #80) and every branch of the club
 * detail page (issue #91) has something to prove.
 *
 * Each seed row maps one-to-one onto the current schema, so a real registration response
 * can be pasted in as-is:
 *
 *   name              -> user.name          (the club name lives on the owning account)
 *   logoUrl           -> user.image         (placeholder until real uploads exist)
 *   affiliationLabel  -> clubs.affiliationId, resolved against the affiliations table
 *   categoryLabels    -> club_categories,   resolved against the categories table
 *   shortDescription  -> clubs.shortDescription
 *   longDescription   -> clubs.longDescription
 *   galleryCount      -> clubs.imageUrls    (placeholders until real uploads exist)
 *   contacts          -> clubs.contacts     (instagram / facebook / tiktok / line_oa)
 *   registrationStatus-> clubs.registrationStatus
 *
 * Re-running is safe: accounts are matched by email, club rows are refreshed field-for-field
 * and keep their id, and category links are replaced. Only rows owned by these demo emails
 * are ever touched. Because ids survive a re-run, a bookmarked /clubs/<id> keeps working.
 *
 * Requires `yarn db:seed` first — affiliations and categories are looked up by label.
 */

const DEMO_PASSWORD = "Demo1234!";

/**
 * /clubs slices results by this — 9 cards per page, per the design. Issue #80 must keep its
 * page size in sync with this constant, and the club distribution below is tuned around it:
 * change one and the "spans two pages" cases stop spanning two pages.
 */
const PAGE_SIZE = 9;

/** Named so a typo becomes a compile error instead of a silently empty filter bucket. */
const AFFILIATION = {
  arts: "อักษรศาสตร์",
  commArts: "นิเทศศาสตร์",
  economics: "เศรษฐศาสตร์",
  engineering: "วิศวกรรมศาสตร์",
  fineArts: "ศิลปกรรมศาสตร์",
  nursing: "พยาบาลศาสตร์",
  politicalScience: "รัฐศาสตร์",
  science: "วิทยาศาสตร์",
  socialDev: "ฝ่ายพัฒนาสังคมและบำเพ็ญประโยชน์ อบจ.",
  sportsScience: "วิทยาศาสตร์การกีฬา",
  architecture: "สถาปัตยกรรมศาสตร์",
} as const;

const CATEGORY = {
  academic: "วิชาการ",
  art: "ศิลปะ",
  business: "ธุรกิจ",
  community: "พัฒนาชุมชน",
  education: "การศึกษา",
  medical: "แพทย์",
  music: "ดนตรี",
  sports: "กีฬา",
  tech: "เทคโนโลยี",
} as const;

type ClubInsert = typeof clubs.$inferInsert;
type ClubContacts = NonNullable<ClubInsert["contacts"]>;
type RegistrationStatus = NonNullable<ClubInsert["registrationStatus"]>;

type ClubSeed = {
  /** Login, and the key every re-run matches on. */
  email: string;
  name: string;
  /** Text drawn onto the placeholder logo and gallery images. */
  imageLabel: string;
  /** null seeds an unaffiliated club — the affiliation filter must not drop it silently. */
  affiliationLabel: string | null;
  /** Empty seeds a club with no tags — ClubHeader hides the tag row for it. */
  categoryLabels: string[];
  shortDescription: string | null;
  longDescription: string | null;
  /** null hides the whole contact section on the detail page. */
  contacts: ClubContacts | null;
  /** Placeholder photos written to imageUrls. 0 hides the gallery section. */
  galleryCount: number;
  /** Defaults to a generated placeholder. null proves ClubHeader's initial-letter fallback. */
  logoUrl?: string | null;
  /** Defaults to COMPLETED. Anything else must never reach /clubs or /clubs/<id>. */
  registrationStatus?: RegistrationStatus;
};

/**
 * 32 publicly visible clubs, deliberately lopsided rather than evenly spread:
 * วิศวกรรมศาสตร์ holds 10 and เทคโนโลยี holds 10, so filtering by either still spans two pages,
 * while ศิลปะ holds exactly 9 — one full page and no second one. Thirteen affiliations are
 * left with no clubs at all, which is the quickest route to the empty state.
 */
const clubSeeds: ClubSeed[] = [
  // ─── วิศวกรรมศาสตร์ ×10 — the affiliation filter that spans two pages ───
  {
    email: "demo.thinc@example.com",
    name: "Thinc.",
    imageLabel: "Thinc",
    affiliationLabel: AFFILIATION.engineering,
    categoryLabels: [CATEGORY.tech, CATEGORY.business],
    shortDescription:
      "ชมรมเทคโนโลยีที่สร้างโปรเจกต์เพื่อสังคม เปิดรับสมาชิกสาย Dev, Design และ Product",
    longDescription:
      "Thinc. รวมนิสิตที่อยากใช้ซอฟต์แวร์แก้ปัญหาจริงในสังคม ทุกภาคการศึกษาเราจับทีมข้ามสาย Dev, Design และ Product แล้วปล่อยโปรเจกต์ออกสู่ผู้ใช้จริง โดยมีรุ่นพี่และเมนเทอร์จากบริษัทเทคโนโลยีคอยรีวิวงานให้ตลอดทาง สมาชิกใหม่ไม่จำเป็นต้องเขียนโค้ดเป็นมาก่อน เพราะมีคลาสปูพื้นฐานให้ในเดือนแรก",
    // The only row with all four channels — proves the contact list wraps and orders correctly.
    contacts: {
      instagram: "thinc.chula",
      facebook: "thinc.chula",
      tiktok: "thinc.chula",
      line_oa: "@thinc",
    },
    galleryCount: 5,
  },
  {
    email: "demo.robotics@example.com",
    name: "CU Robotics Club",
    imageLabel: "CURC",
    affiliationLabel: AFFILIATION.engineering,
    categoryLabels: [CATEGORY.tech],
    shortDescription: "ชมรมหุ่นยนต์จุฬาฯ ออกแบบ ประกอบ และส่งหุ่นยนต์ลงแข่งระดับประเทศทุกปี",
    longDescription:
      "เราทำงานกันเป็นทีมย่อยตามความถนัด ทั้งงานกลไก งานวงจร และงานเขียนโปรแกรมควบคุม เป้าหมายหลักของแต่ละปีคือการส่งหุ่นยนต์ลงแข่งรายการระดับประเทศอย่างน้อยสองรายการ ห้องชมรมเปิดให้ใช้เครื่องมือและเครื่องพิมพ์สามมิติได้ทุกวันทำการ และมีคลาสสอนพื้นฐานไมโครคอนโทรลเลอร์ให้สมาชิกปีหนึ่งช่วงต้นเทอม",
    contacts: { facebook: "cu.robotics.club" },
    galleryCount: 3,
  },
  {
    email: "demo.drone@example.com",
    name: "CU Drone Society",
    imageLabel: "Drone",
    affiliationLabel: AFFILIATION.engineering,
    categoryLabels: [CATEGORY.tech],
    shortDescription: "ชุมชนคนบินโดรน ตั้งแต่ถ่ายภาพมุมสูงจนถึงการแข่งโดรนเรซซิ่ง",
    longDescription:
      "กิจกรรมของเราแบ่งเป็นสองสาย สายถ่ายภาพที่เน้นการวางแผนเส้นทางบินและการเก็บภาพมุมสูงรอบมหาวิทยาลัย กับสายเรซซิ่งที่ประกอบเฟรมและจูนคอนโทรลเลอร์เอง สมาชิกจะได้เรียนกฎการบินและการขออนุญาตพื้นที่อย่างถูกต้องก่อนขึ้นบินจริงเสมอ",
    contacts: { tiktok: "cu.drone" },
    galleryCount: 0,
  },
  {
    email: "demo.engvolunteer@example.com",
    name: "ชมรมวิศวกรรมอาสา",
    imageLabel: "EngVol",
    affiliationLabel: AFFILIATION.engineering,
    categoryLabels: [CATEGORY.community, CATEGORY.education],
    shortDescription: "นำความรู้วิศวกรรมไปซ่อมสร้างให้โรงเรียนและชุมชนที่ขาดแคลนทั่วประเทศ",
    longDescription:
      "ทุกปิดภาคเราออกค่ายไปซ่อมอาคารเรียน เดินระบบไฟ และวางระบบน้ำสะอาดให้โรงเรียนขนาดเล็กในต่างจังหวัด ก่อนออกค่ายจะมีการสำรวจพื้นที่จริงและออกแบบร่วมกับชุมชนเสมอ เพื่อให้สิ่งที่สร้างถูกใช้งานต่อได้จริงหลังเรากลับ สมาชิกทุกคณะสมัครได้ ไม่จำเป็นต้องมีพื้นฐานงานช่าง",
    // LINE official-account ids legitimately start with "@" — ClubContacts must keep it.
    contacts: { line_oa: "@engvolunteer" },
    galleryCount: 2,
  },
  {
    email: "demo.datascience@example.com",
    name: "CU Data Science Club",
    imageLabel: "CUDS",
    affiliationLabel: AFFILIATION.engineering,
    categoryLabels: [CATEGORY.tech, CATEGORY.academic],
    shortDescription:
      "ชมรมวิทยาการข้อมูล เรียนรู้การวิเคราะห์ข้อมูลและแมชชีนเลิร์นนิงผ่านโจทย์จริง",
    longDescription:
      "เราเปิดกลุ่มอ่านเปเปอร์ทุกสองสัปดาห์และจัดแข่งวิเคราะห์ข้อมูลภายในชมรมทุกภาคการศึกษา โจทย์ที่ใช้มาจากชุดข้อมูลเปิดของหน่วยงานรัฐและจากพาร์ตเนอร์ภาคเอกชน สมาชิกจะได้ฝึกตั้งแต่การทำความสะอาดข้อมูลไปจนถึงการนำเสนอผลให้ผู้ที่ไม่ได้มีพื้นฐานเชิงเทคนิคเข้าใจ",
    contacts: { facebook: "cu.datascience" },
    galleryCount: 0,
  },
  {
    email: "demo.motorsport@example.com",
    name: "Chula Motorsport",
    imageLabel: "CUMS",
    affiliationLabel: AFFILIATION.engineering,
    categoryLabels: [CATEGORY.tech, CATEGORY.sports],
    shortDescription: "ทีมนิสิตที่ออกแบบและสร้างรถแข่งฟอร์มูล่าลงแข่งขันในรายการนักศึกษา",
    longDescription:
      "หนึ่งปีการศึกษาคือหนึ่งคันรถ ตั้งแต่การออกแบบเฟรม การเลือกระบบส่งกำลัง ไปจนถึงการทดสอบในสนามจริง ทีมแบ่งเป็นฝ่ายวิศวกรรมและฝ่ายบริหารที่ดูแลสปอนเซอร์และงบประมาณ ทำให้นิสิตสายบริหารและสายสื่อสารก็มีที่ยืนในทีมเช่นกัน",
    contacts: { instagram: "chula.motorsport" },
    galleryCount: 4,
  },
  {
    email: "demo.energy@example.com",
    name: "ชมรมพลังงานทดแทนจุฬาฯ",
    imageLabel: "Energy",
    affiliationLabel: AFFILIATION.engineering,
    categoryLabels: [CATEGORY.tech, CATEGORY.community],
    // "โซลาร์เซลล์" appears in no other club's name, affiliation or category — the
    // shortDescription-only search case.
    shortDescription:
      "ติดตั้งแผงโซลาร์เซลล์ให้ชุมชนที่ไฟฟ้าเข้าไม่ถึง พร้อมอบรมการดูแลรักษาให้คนในพื้นที่ทำต่อเองได้",
    longDescription:
      "เราติดตั้งแผงโซลาร์เซลล์ให้โรงเรียนและศูนย์การเรียนรู้ในพื้นที่ห่างไกล พร้อมอบรมการดูแลรักษาให้คนในพื้นที่ทำเองได้ นอกจากงานภาคสนาม ชมรมยังจัดวงเสวนาเรื่องนโยบายพลังงานและการเปลี่ยนผ่านสู่พลังงานสะอาดร่วมกับคณะอื่นเป็นประจำ",
    contacts: { line_oa: "@cuenergyclub" },
    galleryCount: 1,
  },
  {
    email: "demo.cybersec@example.com",
    name: "CU Cybersecurity Guild",
    imageLabel: "CUSec",
    affiliationLabel: AFFILIATION.engineering,
    categoryLabels: [CATEGORY.tech, CATEGORY.academic],
    shortDescription: "ชมรมความมั่นคงปลอดภัยไซเบอร์ ฝึก CTF และการทดสอบเจาะระบบอย่างมีจริยธรรม",
    longDescription:
      "สมาชิกฝึกโจทย์ Capture The Flag ประจำสัปดาห์ ครอบคลุมทั้งงานเว็บ งานวิเคราะห์ไบนารี และงานนิติวิทยาศาสตร์ดิจิทัล ชมรมเน้นย้ำเรื่องขอบเขตทางกฎหมายและจริยธรรมก่อนลงมือทุกครั้ง และส่งทีมลงแข่งรายการระดับประเทศปีละสองครั้ง",
    // Stored as a full URL rather than a handle — ClubContacts must link to it verbatim
    // instead of appending it to the Facebook base URL.
    contacts: { facebook: "https://www.facebook.com/cu.cybersec.guild" },
    galleryCount: 0,
  },
  {
    email: "demo.intania@example.com",
    name: "Intania Music Band",
    imageLabel: "Intania",
    affiliationLabel: AFFILIATION.engineering,
    categoryLabels: [CATEGORY.music],
    shortDescription: "วงดนตรีประจำคณะวิศวฯ เล่นทั้งงานรับน้อง งานกีฬา และคอนเสิร์ตประจำปี",
    longDescription:
      "วงเปิดรับทั้งนักดนตรีที่เล่นเป็นแล้วและคนที่เพิ่งเริ่มจับเครื่องดนตรี เรามีห้องซ้อมประจำและรุ่นพี่ที่สอนให้ฟรีในช่วงต้นเทอม ตารางงานหลักคือคอนเสิร์ตประจำปีปลายภาคปลาย ซึ่งสมาชิกทุกคนจะได้ขึ้นเวทีอย่างน้อยหนึ่งเพลง",
    contacts: { instagram: "intania.band" },
    galleryCount: 5,
  },
  {
    email: "demo.creativecode@example.com",
    name: "CU Creative Coding Club",
    imageLabel: "CreCode",
    affiliationLabel: AFFILIATION.engineering,
    // The row that tips วิศวกรรมศาสตร์ and เทคโนโลยี to 10 (two pages) and ศิลปะ to 9
    // (exactly one full page) — the three pagination boundaries worth clicking.
    categoryLabels: [CATEGORY.tech, CATEGORY.art],
    shortDescription:
      "รวมคนเขียนโค้ดกับคนทำงานภาพเข้าด้วยกัน สร้างงานอินเทอร์แอกทีฟและวิชวลสำหรับจัดแสดงจริง",
    longDescription:
      "เราทำงานที่อยู่กึ่งกลางระหว่างโปรแกรมมิงกับงานออกแบบ ทั้งงานวิชวลที่ตอบสนองกับเสียง งานฉายภาพลงบนอาคาร และงานติดตั้งที่ผู้ชมเข้าไปมีส่วนร่วมได้ สมาชิกจับคู่กันทำงานข้ามสายเสมอ คนเขียนโค้ดได้เรียนเรื่ององค์ประกอบภาพ ส่วนคนทำงานภาพได้เริ่มเขียนโปรแกรมจากศูนย์ ผลงานทั้งหมดถูกนำไปจัดแสดงในนิทรรศการปลายภาคของชมรม",
    contacts: { instagram: "cu.creativecoding", tiktok: "cu.creativecoding" },
    galleryCount: 4,
  },

  // ─── วิทยาศาสตร์ ×4 ───
  {
    email: "demo.astronomy@example.com",
    name: "CU Astronomy Club",
    imageLabel: "CUAstro",
    affiliationLabel: AFFILIATION.science,
    categoryLabels: [CATEGORY.tech, CATEGORY.education],
    shortDescription: "ชมรมดาราศาสตร์ จัดกิจกรรมดูดาวและสอนใช้กล้องโทรทรรศน์สำหรับผู้เริ่มต้น",
    longDescription:
      "เราจัดทริปดูดาวนอกเมืองภาคละหนึ่งครั้ง และเปิดลานดูดาวในมหาวิทยาลัยทุกคืนเดือนมืด สมาชิกจะได้เรียนการตั้งกล้องโทรทรรศน์ การอ่านแผนที่ดาว และการถ่ายภาพวัตถุท้องฟ้าเบื้องต้น ชมรมมีกล้องให้ยืมโดยไม่ต้องมีอุปกรณ์ของตัวเอง",
    contacts: { tiktok: "cu.astronomy" },
    galleryCount: 5,
  },
  {
    email: "demo.biofield@example.com",
    name: "ชมรมชีววิทยาภาคสนาม",
    imageLabel: "BioField",
    affiliationLabel: AFFILIATION.science,
    categoryLabels: [CATEGORY.community, CATEGORY.academic],
    shortDescription: "ออกสำรวจระบบนิเวศจริง เก็บข้อมูลความหลากหลายทางชีวภาพร่วมกับชุมชนท้องถิ่น",
    longDescription:
      "ชมรมจัดทริปสำรวจป่าชายเลนและป่าต้นน้ำปีละสองครั้ง สมาชิกจะได้ฝึกวิธีสำรวจภาคสนาม การจำแนกชนิดพันธุ์ และการบันทึกข้อมูลลงฐานข้อมูลเปิด ข้อมูลที่เก็บได้ถูกส่งต่อให้กลุ่มอนุรักษ์ในพื้นที่ใช้งานต่อจริง",
    contacts: { facebook: "biofield.cu" },
    galleryCount: 3,
  },
  {
    email: "demo.scicomm@example.com",
    name: "Chula Science Communicators",
    imageLabel: "SciComm",
    affiliationLabel: AFFILIATION.science,
    categoryLabels: [CATEGORY.education, CATEGORY.academic],
    shortDescription:
      "เปลี่ยนงานวิจัยให้เป็นเรื่องเล่าที่คนทั่วไปเข้าใจ ผ่านบทความ คลิป และนิทรรศการ",
    longDescription:
      "เราผลิตคอนเทนต์วิทยาศาสตร์เผยแพร่สู่สาธารณะทุกสัปดาห์ ทั้งบทความสั้น คลิปอธิบาย และโปสเตอร์สำหรับงานนิทรรศการ สมาชิกจะได้ฝึกสัมภาษณ์นักวิจัยจริงและเรียบเรียงเนื้อหาให้ถูกต้องแต่ยังอ่านสนุก ชมรมยังจัดเวิร์กช็อปการนำเสนอให้นิสิตคณะอื่นตามคำเชิญด้วย",
    contacts: { instagram: "chula.scicomm" },
    galleryCount: 0,
  },
  {
    email: "demo.chess@example.com",
    name: "CU Chess Club",
    imageLabel: "CUChess",
    affiliationLabel: AFFILIATION.science,
    categoryLabels: [CATEGORY.sports],
    shortDescription: "ชมรมหมากรุกสากล เปิดกระดานให้เล่นทุกเย็นวันพุธ ไม่จำกัดระดับฝีมือ",
    longDescription:
      "ทุกเย็นวันพุธเราเปิดโต๊ะให้เล่นอิสระและมีรุ่นพี่คอยวิเคราะห์เกมให้หลังจบ ชมรมจัดการแข่งขันภายในแบบสวิสระบบสี่รอบทุกปลายภาค และส่งตัวแทนลงแข่งรายการมหาวิทยาลัย สมาชิกใหม่ที่เพิ่งเริ่มเล่นมีคลาสสอนเปิดหมากให้แยกต่างหาก",
    contacts: { line_oa: "@cuchess" },
    galleryCount: 1,
  },

  // ─── นิเทศศาสตร์ ×3 ───
  {
    email: "demo.film@example.com",
    name: "CU Film Society",
    imageLabel: "CUFilm",
    affiliationLabel: AFFILIATION.commArts,
    categoryLabels: [CATEGORY.art],
    shortDescription: "ชมรมภาพยนตร์ ฉายหนังนอกกระแสและผลิตหนังสั้นของนิสิตเอง",
    longDescription:
      "เราจัดฉายหนังพร้อมวงสนทนาหลังฉายเดือนละสองครั้ง และเปิดกองถ่ายหนังสั้นของชมรมภาคละหนึ่งเรื่อง สมาชิกเลือกได้ว่าจะอยู่ฝ่ายเขียนบท กำกับ ถ่ายภาพ หรือตัดต่อ อุปกรณ์กล้องและไฟของชมรมให้ยืมใช้ได้ตลอดการถ่ายทำ",
    contacts: { instagram: "cu.filmsociety", tiktok: "cu.filmsociety" },
    galleryCount: 5,
  },
  {
    email: "demo.podcast@example.com",
    name: "ชมรมวิทยุสมัครเล่นและพอดแคสต์",
    imageLabel: "Podcast",
    affiliationLabel: AFFILIATION.commArts,
    categoryLabels: [CATEGORY.art, CATEGORY.music],
    shortDescription: "ผลิตรายการเสียงของนิสิต ตั้งแต่จัดผังรายการจนถึงมิกซ์เสียงในห้องอัด",
    longDescription:
      "ชมรมดูแลรายการประจำสัปดาห์สามรายการ ครอบคลุมทั้งข่าวในมหาวิทยาลัย บทสัมภาษณ์ศิษย์เก่า และรายการเพลง สมาชิกจะได้ฝึกใช้ห้องอัดจริง ตั้งแต่การเซ็ตไมค์ไปจนถึงการมิกซ์และปล่อยตอนขึ้นแพลตฟอร์ม ใครสนใจงานเบื้องหลังล้วนก็สมัครฝ่ายเทคนิคได้",
    contacts: { tiktok: "cu.podcast.club" },
    galleryCount: 2,
  },
  {
    email: "demo.debate@example.com",
    name: "Chula Debate Club",
    imageLabel: "Debate",
    affiliationLabel: AFFILIATION.commArts,
    categoryLabels: [CATEGORY.education, CATEGORY.academic],
    shortDescription: "ชมรมโต้วาที ฝึกคิดเป็นระบบและพูดให้คนฟังคล้อยตามในเวลาจำกัด",
    longDescription:
      "เราซ้อมโต้วาทีรูปแบบ British Parliamentary ทุกสัปดาห์ พร้อมรับฟีดแบ็กจากกรรมการที่มีประสบการณ์แข่งระดับนานาชาติ ชมรมส่งทีมลงแข่งทั้งรายการภาษาไทยและภาษาอังกฤษ และเปิดคลาสพื้นฐานสำหรับคนที่ไม่เคยโต้วาทีมาก่อนทุกต้นภาคการศึกษา",
    contacts: { facebook: "chula.debate" },
    galleryCount: 0,
  },

  // ─── เศรษฐศาสตร์ ×3 ───
  {
    email: "demo.entrepreneurs@example.com",
    name: "Chula Entrepreneurs",
    imageLabel: "CUENT",
    affiliationLabel: AFFILIATION.economics,
    categoryLabels: [CATEGORY.business, CATEGORY.tech, CATEGORY.education],
    shortDescription: "ชมรมธุรกิจและการลงทุน จัดทอล์ก Networking และพิตช์เดย์ตลอดปี",
    longDescription:
      "ชมรมเชื่อมนิสิตที่อยากเริ่มธุรกิจเข้ากับผู้ก่อตั้งและนักลงทุนตัวจริง กิจกรรมหลักคือทอล์กประจำเดือน คลาสอ่านงบการเงิน และพิตช์เดย์ปลายภาคที่เปิดให้ทีมนิสิตนำเสนอไอเดียต่อกรรมการภายนอก ทีมที่ผ่านรอบสุดท้ายจะได้เมนเทอร์ประกบต่ออีกหนึ่งภาคการศึกษา",
    contacts: { instagram: "chula.entrepreneurs", facebook: "chula.entrepreneurs" },
    galleryCount: 3,
  },
  {
    email: "demo.investment@example.com",
    name: "CU Investment Club",
    imageLabel: "CUInvest",
    affiliationLabel: AFFILIATION.economics,
    categoryLabels: [CATEGORY.business],
    // The one club with no short description — the /clubs card and the search matcher both
    // have to cope with a null here, and the detail page falls back to longDescription.
    shortDescription: null,
    longDescription:
      "สมาชิกแบ่งกลุ่มตามกลุ่มอุตสาหกรรมและนำเสนอบทวิเคราะห์หุ้นรายตัวสัปดาห์ละครั้ง ชมรมบริหารพอร์ตจำลองร่วมกันและทบทวนผลตอบแทนทุกสิ้นภาค เราเน้นกระบวนการวิเคราะห์และการบริหารความเสี่ยงมากกว่าการเดาทิศทางตลาดระยะสั้น",
    contacts: { line_oa: "@cuinvestment" },
    galleryCount: 0,
  },
  {
    email: "demo.marketing@example.com",
    name: "Chula Marketing Society",
    imageLabel: "CUMkt",
    affiliationLabel: AFFILIATION.economics,
    categoryLabels: [CATEGORY.business, CATEGORY.art],
    shortDescription: "ชมรมการตลาด ลงแข่งเคสจริงจากแบรนด์และผลิตแคมเปญให้ลูกค้าในมหาวิทยาลัย",
    longDescription:
      "เรารับโจทย์จริงจากแบรนด์และหน่วยงานภายในมหาวิทยาลัยมาทำเป็นแคมเปญเต็มรูปแบบ ตั้งแต่วิจัยผู้บริโภค วางกลยุทธ์ ไปจนถึงผลิตชิ้นงานสื่อสาร สมาชิกที่สนใจสายประกวดยังได้รวมทีมลงแข่งรายการเคสคอมเพททิชันระดับประเทศร่วมกับรุ่นพี่ด้วย",
    contacts: { instagram: "chula.marketing" },
    galleryCount: 4,
  },

  // ─── อักษรศาสตร์ ×2 ───
  {
    email: "demo.literature@example.com",
    name: "ชมรมวรรณศิลป์จุฬาฯ",
    imageLabel: "Litera",
    affiliationLabel: AFFILIATION.arts,
    categoryLabels: [CATEGORY.art],
    shortDescription: "ชมรมนักเขียน จัดวงอ่านงานและออกวารสารวรรณกรรมของนิสิตปีละสองเล่ม",
    longDescription:
      "เรามีวงอ่านงานทุกสองสัปดาห์ที่สมาชิกนำงานเขียนของตัวเองมาให้เพื่อนร่วมวิจารณ์อย่างตรงไปตรงมา ผลงานที่ผ่านการขัดเกลาจะถูกคัดลงวารสารของชมรมซึ่งออกปีละสองเล่ม นอกจากนี้ยังมีวงเสวนากับนักเขียนรับเชิญภาคละหนึ่งครั้ง",
    contacts: { facebook: "chula.literature" },
    galleryCount: 0,
  },
  {
    email: "demo.japanese@example.com",
    name: "CU Japanese Culture Club",
    imageLabel: "CUJapan",
    affiliationLabel: AFFILIATION.arts,
    categoryLabels: [CATEGORY.art, CATEGORY.music],
    shortDescription: "ชมรมวัฒนธรรมญี่ปุ่น ทั้งภาษา อาหาร ดนตรี และงานเทศกาลประจำปี",
    longDescription:
      "กิจกรรมของชมรมครอบคลุมตั้งแต่คลาสสนทนาภาษาญี่ปุ่นระดับต้น เวิร์กช็อปทำอาหาร ไปจนถึงวงดนตรีที่เล่นเพลงญี่ปุ่นในงานเทศกาลประจำปี งานใหญ่ที่สุดคือเทศกาลปลายภาคที่เปิดให้คนนอกเข้าชม ซึ่งสมาชิกทุกคนมีส่วนร่วมในการจัด",
    contacts: { tiktok: "cu.japanclub" },
    galleryCount: 5,
  },

  // ─── ศิลปกรรมศาสตร์ ×2 ───
  {
    email: "demo.music@example.com",
    name: "Chula Music Club",
    imageLabel: "Music",
    affiliationLabel: AFFILIATION.fineArts,
    categoryLabels: [CATEGORY.music, CATEGORY.art],
    shortDescription: "ชุมชนคนรักดนตรี ทั้งร้อง เล่น และโปรดิวซ์ เปิดรับทุกคณะ",
    longDescription:
      "ชมรมมีห้องซ้อมและอุปกรณ์ครบสำหรับวงเต็ม สมาชิกจับวงกันเองได้อิสระและมีเวทีให้ขึ้นเล่นทุกเดือนผ่านกิจกรรม Open Mic สำหรับคนที่สนใจสายโปรดิวซ์ ชมรมเปิดคลาสสอนทำเพลงในคอมพิวเตอร์และมีห้องอัดขนาดเล็กให้จองใช้งาน",
    contacts: { instagram: "chula.music" },
    galleryCount: 5,
  },
  {
    email: "demo.drama@example.com",
    name: "ชมรมนาฏศิลป์และการละคร",
    imageLabel: "Drama",
    affiliationLabel: AFFILIATION.fineArts,
    categoryLabels: [CATEGORY.art, CATEGORY.music],
    shortDescription: "ชมรมการแสดง ผลิตละครเวทีประจำปีและสอนนาฏศิลป์ไทยให้ผู้เริ่มต้น",
    longDescription:
      "งานหลักของชมรมคือละครเวทีประจำปีที่เปิดแสดงสามรอบช่วงปลายภาคปลาย นอกจากนักแสดง เรายังต้องการทีมฉาก ทีมแสงสี และทีมเครื่องแต่งกายจำนวนมาก ระหว่างปีมีคลาสนาฏศิลป์ไทยและคลาสการแสดงพื้นฐานเปิดให้สมาชิกเรียนฟรี",
    contacts: { tiktok: "cu.dramaclub" },
    galleryCount: 3,
  },

  // ─── วิทยาศาสตร์การกีฬา ×2 ───
  {
    email: "demo.sports@example.com",
    name: "CU Sports Society",
    imageLabel: "CUSport",
    affiliationLabel: AFFILIATION.sportsScience,
    categoryLabels: [CATEGORY.sports],
    shortDescription: "ชมรมกีฬาหลากหลายชนิด เน้นสุขภาพและมิตรภาพข้ามคณะ",
    longDescription:
      "ชมรมดูแลกีฬาหลายชนิดภายใต้ร่มเดียวกัน ทั้งฟุตบอล บาสเกตบอล แบดมินตัน และวอลเลย์บอล สมาชิกเลือกลงกีฬาได้มากกว่าหนึ่งชนิดและมีตารางซ้อมประจำสัปดาห์ที่ชัดเจน งานใหญ่ประจำปีคือทัวร์นาเมนต์ระหว่างคณะที่ชมรมเป็นเจ้าภาพจัด",
    contacts: { instagram: "cu.sports" },
    galleryCount: 2,
  },
  {
    email: "demo.running@example.com",
    name: "ชมรมวิ่งจุฬาฯ",
    imageLabel: "CURun",
    affiliationLabel: AFFILIATION.sportsScience,
    // Tagged แพทย์ but never says it in the name, description or affiliation — the
    // category-only search case.
    categoryLabels: [CATEGORY.sports, CATEGORY.community, CATEGORY.medical],
    shortDescription: "ซ้อมวิ่งด้วยกันทุกเช้าวันเสาร์ และจัดงานวิ่งการกุศลประจำปีในมหาวิทยาลัย",
    longDescription:
      "เราซ้อมร่วมกันทุกเช้าวันเสาร์โดยแบ่งกลุ่มตามระยะและความเร็ว มีโค้ชอาสาช่วยดูฟอร์มการวิ่งและวางโปรแกรมซ้อมให้สมาชิกที่เตรียมลงงานแข่ง งานประจำปีของชมรมคืองานวิ่งการกุศลที่รายได้ทั้งหมดมอบให้โรงพยาบาลในเครือมหาวิทยาลัย",
    contacts: { facebook: "cu.running.club" },
    galleryCount: 4,
  },

  // ─── พยาบาลศาสตร์ ×2 ───
  {
    email: "demo.medvolunteer@example.com",
    name: "CU Medical Volunteer",
    imageLabel: "CUMed",
    affiliationLabel: AFFILIATION.nursing,
    categoryLabels: [CATEGORY.medical, CATEGORY.community],
    shortDescription: "ออกหน่วยแพทย์เคลื่อนที่และให้ความรู้สุขภาพแก่ชุมชนรอบมหาวิทยาลัย",
    longDescription:
      "ชมรมออกหน่วยร่วมกับอาจารย์แพทย์และพยาบาลเดือนละครั้ง ให้บริการตรวจสุขภาพเบื้องต้นและให้ความรู้เรื่องโรคเรื้อรังแก่ชุมชน สมาชิกที่ไม่ได้เรียนสายสุขภาพก็ช่วยงานลงทะเบียน งานสื่อสาร และงานประสานชุมชนได้ ทุกคนต้องผ่านการอบรมความปลอดภัยก่อนออกหน่วยครั้งแรก",
    contacts: { instagram: "cu.medvolunteer" },
    galleryCount: 1,
  },
  {
    email: "demo.firstaid@example.com",
    name: "ชมรมปฐมพยาบาลและกู้ชีพ",
    imageLabel: "FirstAid",
    affiliationLabel: AFFILIATION.nursing,
    categoryLabels: [CATEGORY.medical, CATEGORY.education],
    shortDescription: "อบรมการช่วยฟื้นคืนชีพและดูแลจุดปฐมพยาบาลในงานกิจกรรมของมหาวิทยาลัย",
    longDescription:
      "สมาชิกทุกคนผ่านการอบรมการช่วยฟื้นคืนชีพและการใช้เครื่องกระตุกหัวใจไฟฟ้าจากวิทยากรที่ได้รับการรับรอง ชมรมรับหน้าที่ดูแลจุดปฐมพยาบาลในงานกีฬาและงานเทศกาลของมหาวิทยาลัย และเปิดคลาสอบรมให้นิสิตทั่วไปฟรีภาคละสองรอบ",
    contacts: { instagram: "cu.firstaid" },
    galleryCount: 0,
  },

  // ─── ฝ่ายพัฒนาสังคมและบำเพ็ญประโยชน์ อบจ. ×1 ───
  {
    email: "demo.educamp@example.com",
    name: "ชมรมค่ายอาสาพัฒนาการศึกษา",
    imageLabel: "EduCamp",
    affiliationLabel: AFFILIATION.socialDev,
    categoryLabels: [CATEGORY.education, CATEGORY.community],
    shortDescription: "จัดค่ายติวและกิจกรรมการเรียนรู้ให้โรงเรียนขยายโอกาสในต่างจังหวัด",
    longDescription:
      "ทุกปิดภาคเราออกค่ายไปจัดกิจกรรมการเรียนรู้ให้นักเรียนมัธยมต้นในโรงเรียนขยายโอกาส ทั้งค่ายติววิชาหลักและกิจกรรมแนะแนวการศึกษาต่อ สมาชิกจะได้ออกแบบแผนการสอนเองและซ้อมสอนกับรุ่นพี่ก่อนลงพื้นที่จริงทุกครั้ง",
    contacts: { facebook: "cu.educamp" },
    galleryCount: 5,
  },

  // ─── รัฐศาสตร์ ×1 ───
  {
    email: "demo.mun@example.com",
    name: "CU Model United Nations",
    imageLabel: "CUMUN",
    affiliationLabel: AFFILIATION.politicalScience,
    categoryLabels: [CATEGORY.education, CATEGORY.academic],
    shortDescription: "จำลองการประชุมสหประชาชาติ ฝึกเจรจาและร่างข้อมติเป็นภาษาอังกฤษ",
    longDescription:
      "ชมรมจัดการประชุมจำลองภายในภาคละหนึ่งครั้ง และส่งผู้แทนไปร่วมงานของมหาวิทยาลัยอื่นตลอดปี สมาชิกจะได้ฝึกค้นคว้าจุดยืนของประเทศที่ได้รับมอบหมาย เขียนเอกสารแสดงจุดยืน และเจรจาหาเสียงสนับสนุนในห้องประชุมจริง มีคลาสปูพื้นฐานให้ผู้ที่ไม่เคยเข้าร่วมมาก่อน",
    contacts: { instagram: "cu.mun" },
    galleryCount: 2,
  },

  // ─── สถาปัตยกรรมศาสตร์ ×1 ───
  {
    email: "demo.urbansketch@example.com",
    name: "Chula Urban Sketchers",
    imageLabel: "Sketch",
    // Sole สถาปัตยกรรมศาสตร์ club, and "สถาปัตย" appears in no name or description —
    // the affiliation-only search case.
    affiliationLabel: AFFILIATION.architecture,
    categoryLabels: [CATEGORY.art, CATEGORY.community],
    shortDescription: "ออกไปวาดรูปนอกสถานที่ทุกสุดสัปดาห์ บันทึกเมืองและย่านเก่าด้วยลายเส้น",
    longDescription:
      "ทุกสุดสัปดาห์เรานัดกันไปวาดรูปตามย่านเก่าและพื้นที่สาธารณะในกรุงเทพฯ ไม่มีการสอนแบบเป็นทางการ แต่ทุกคนจะได้ดูวิธีทำงานของกันและกันและแลกเปลี่ยนเทคนิคหลังจบรอบ ผลงานตลอดปีถูกรวบรวมจัดนิทรรศการเล็กในมหาวิทยาลัยช่วงปลายภาคปลาย",
    contacts: { tiktok: "chula.urbansketch" },
    galleryCount: 5,
  },

  // ─── The sparsest row a COMPLETED club can be: everything optional left empty. ───
  {
    email: "demo.boardgame@example.com",
    name: "CU Board Game Club",
    imageLabel: "BoardGame",
    // No affiliation and no categories, so neither filter can claim it — it must still be
    // reachable with no filters applied, and must survive "show all".
    affiliationLabel: null,
    categoryLabels: [],
    shortDescription: "นัดเล่นบอร์ดเกมกันทุกเย็นวันศุกร์ที่โรงอาหาร ยืมเกมของชมรมได้ฟรี",
    // No long description — the detail page falls back to shortDescription.
    longDescription: null,
    // No contacts and no logo — the contact section is hidden and ClubHeader draws the
    // initial-letter avatar instead.
    contacts: null,
    galleryCount: 0,
    logoUrl: null,
  },

  // ─── Negative cases: both rows exist so /clubs can be proven to exclude them. ───
  {
    email: "demo.pending@example.com",
    name: "ชมรมรอกรอกข้อมูล (ต้องไม่ขึ้นในหน้า /clubs)",
    imageLabel: "Pending",
    affiliationLabel: AFFILIATION.engineering,
    categoryLabels: [CATEGORY.tech],
    shortDescription:
      "เรกคอร์ดนี้ยังอยู่สถานะ PENDING ใช้ทดสอบว่าหน้า /clubs แสดงเฉพาะชมรมที่ลงทะเบียนเสร็จแล้ว หากเห็นการ์ดนี้แปลว่าตัวกรองพัง",
    longDescription:
      "ชมรมที่ได้รับรหัสเชิญแล้วแต่ยังไม่ได้กรอกข้อมูลจะค้างอยู่ที่สถานะนี้ ทั้งหน้ารายชื่อชมรมและหน้ารายละเอียดชมรมต้องปฏิบัติกับเรกคอร์ดนี้เหมือนไม่มีอยู่",
    contacts: { instagram: "cu.pending.demo" },
    galleryCount: 0,
    registrationStatus: "PENDING",
  },
  {
    email: "demo.infosubmitted@example.com",
    name: "ชมรมส่งข้อมูลแล้วรอตรวจ (ต้องไม่ขึ้นในหน้า /clubs)",
    imageLabel: "Review",
    affiliationLabel: AFFILIATION.science,
    categoryLabels: [CATEGORY.education],
    shortDescription:
      "เรกคอร์ดนี้อยู่สถานะ INFO_SUBMITTED ใช้ทดสอบว่าชมรมที่ยังรอตรวจไม่ถูกแสดง หากเห็นการ์ดนี้แปลว่าตัวกรองพัง",
    longDescription:
      "ชมรมที่กรอกข้อมูลครบแล้วแต่ยังรอการตรวจสอบจะค้างอยู่ที่สถานะนี้ ข้อมูลครบถ้วนพอจะเรนเดอร์ได้ทุกส่วน ซึ่งเป็นเหตุผลที่ต้องกรองด้วยสถานะ ไม่ใช่ด้วยความครบถ้วนของข้อมูล",
    contacts: { facebook: "cu.review.demo" },
    galleryCount: 3,
    registrationStatus: "INFO_SUBMITTED",
  },
];

/** A student account to browse /clubs with, mirroring the club accounts' login pattern. */
const student = {
  email: "demo.student@example.com",
  name: "Demo Student",
};

function placeholderImage(label: string, w: number, h: number, bg: string) {
  return `https://placehold.co/${w}x${h}/${bg}/FFFFFF/png?text=${encodeURIComponent(label)}`;
}

const logoImage = (label: string) => placeholderImage(label, 200, 200, "DD598C");

/** Gallery placeholders are numbered so the lightbox's next/prev is obvious while clicking. */
const galleryImages = (label: string, count: number) =>
  Array.from({ length: count }, (_, i) =>
    placeholderImage(`${label} ${i + 1}`, 800, 600, "EEACC5")
  );

function requireId<T>(map: Map<string, T>, label: string, kind: string): T {
  const id = map.get(label);
  if (id === undefined) {
    throw new Error(
      `Missing ${kind} "${label}". Run \`yarn db:seed\` first, then re-run this script.`
    );
  }
  return id;
}

async function ensureUser(opts: {
  email: string;
  name: string;
  role: "STUDENT" | "CLUB";
  image?: string | null;
}) {
  const existing = await db.query.user.findFirst({ where: eq(user.email, opts.email) });

  // `role` is declared with `input: false` in src/server/auth.ts, so signUpEmail can't set
  // it — both branches write it directly instead.
  const values = {
    name: opts.name,
    role: opts.role,
    image: opts.image ?? null,
    emailVerified: true,
  };

  if (existing) {
    await db.update(user).set(values).where(eq(user.id, existing.id));
    return { userId: existing.id, created: false };
  }

  const result = await auth.api.signUpEmail({
    body: { email: opts.email, password: DEMO_PASSWORD, name: opts.name },
  });
  await db.update(user).set(values).where(eq(user.id, result.user.id));

  return { userId: result.user.id, created: true };
}

type Lookups = {
  affiliationByLabel: Map<string, number>;
  categoryByLabel: Map<string, number>;
};

async function seedClub(seed: ClubSeed, lookups: Lookups) {
  const affiliationId = seed.affiliationLabel
    ? requireId(lookups.affiliationByLabel, seed.affiliationLabel, "affiliation")
    : null;
  const categoryIds = seed.categoryLabels.map((label) =>
    requireId(lookups.categoryByLabel, label, "category")
  );

  const { userId, created } = await ensureUser({
    email: seed.email,
    name: seed.name,
    role: "CLUB",
    image: seed.logoUrl === undefined ? logoImage(seed.imageLabel) : seed.logoUrl,
  });

  const values = {
    registrationStatus: seed.registrationStatus ?? ("COMPLETED" as const),
    affiliationId,
    shortDescription: seed.shortDescription,
    longDescription: seed.longDescription,
    imageUrls: galleryImages(seed.imageLabel, seed.galleryCount),
    contacts: seed.contacts,
  };

  // Matched on userId, which is unique on clubs — so a re-run updates in place and the club
  // id (and therefore any bookmarked /clubs/<id>) stays stable.
  const existingClub = await db.query.clubs.findFirst({
    where: eq(clubs.userId, userId),
    columns: { id: true },
  });

  let clubId: string;
  if (existingClub) {
    clubId = existingClub.id;
    await db.update(clubs).set(values).where(eq(clubs.id, clubId));
  } else {
    const inserted = await db
      .insert(clubs)
      .values({ ...values, userId })
      .returning({ id: clubs.id });
    clubId = inserted[0]!.id;
  }

  await db.delete(clubCategories).where(eq(clubCategories.clubId, clubId));
  if (categoryIds.length > 0) {
    await db
      .insert(clubCategories)
      .values(categoryIds.map((categoryId) => ({ clubId, categoryId })));
  }

  const status = seed.registrationStatus ?? "COMPLETED";
  const flag = status === "COMPLETED" ? "" : ` [${status}]`;
  console.log(
    `  ${created ? "+" : "~"} ${seed.name}${flag} — ${seed.affiliationLabel ?? "ไม่สังกัด"}, ` +
      `${seed.categoryLabels.length} category(s), ${seed.galleryCount} photo(s)`
  );

  return clubId;
}

/**
 * Mirrors the search /clubs is expected to run. Issue #80 must keep its matcher in sync with
 * this one, otherwise the hints printed below stop being true.
 */
function matchesSearch(seed: ClubSeed, needle: string) {
  const term = needle.trim().toLowerCase();
  if (!term) return true;

  return (
    seed.name.toLowerCase().includes(term) ||
    (seed.shortDescription ?? "").toLowerCase().includes(term) ||
    (seed.affiliationLabel ?? "").toLowerCase().includes(term) ||
    seed.categoryLabels.some((label) => label.toLowerCase().includes(term))
  );
}

function pagesFor(count: number) {
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  return `${count} club(s) → ${pages} page(s)`;
}

function printHints(visible: ClubSeed[], affiliationTotal: number) {
  const byAffiliation = new Map<string, number>();
  const byCategory = new Map<string, number>();
  for (const seed of visible) {
    if (seed.affiliationLabel) {
      byAffiliation.set(seed.affiliationLabel, (byAffiliation.get(seed.affiliationLabel) ?? 0) + 1);
    }
    for (const label of seed.categoryLabels) {
      byCategory.set(label, (byCategory.get(label) ?? 0) + 1);
    }
  }

  const lastPageSize = visible.length % PAGE_SIZE || PAGE_SIZE;
  const searchCount = (needle: string) => visible.filter((s) => matchesSearch(s, needle)).length;
  const affiliationCount = (label: string) => byAffiliation.get(label) ?? 0;
  const categoryCount = (label: string) => byCategory.get(label) ?? 0;
  const unaffiliated = visible.filter((s) => s.affiliationLabel === null).length;

  console.log(`\n─── What to try on /clubs (PAGE_SIZE = ${PAGE_SIZE}) ───`);
  console.log(`Pagination   ${pagesFor(visible.length)}, last page holds ${lastPageSize}`);
  console.log(
    `Affiliation  "${AFFILIATION.engineering}" → ${pagesFor(affiliationCount(AFFILIATION.engineering))}`
  );
  console.log(
    `             "${AFFILIATION.architecture}" → ${pagesFor(affiliationCount(AFFILIATION.architecture))}`
  );
  console.log(`Category     "${CATEGORY.tech}" → ${pagesFor(categoryCount(CATEGORY.tech))}`);
  console.log(
    `             "${CATEGORY.art}" → ${pagesFor(categoryCount(CATEGORY.art))} — exactly one full page, no page 2`
  );
  console.log(`             "${CATEGORY.medical}" → ${pagesFor(categoryCount(CATEGORY.medical))}`);
  console.log(`Search       "CU" → ${pagesFor(searchCount("CU"))}`);
  console.log(`             "ชมรม" → ${pagesFor(searchCount("ชมรม"))}`);
  console.log(
    `             "โซลาร์เซลล์" → ${searchCount("โซลาร์เซลล์")} club(s), matches shortDescription only`
  );
  console.log(
    `             "สถาปัตย" → ${searchCount("สถาปัตย")} club(s), matches affiliation only`
  );
  console.log(
    `             "${CATEGORY.medical}" → ${searchCount(CATEGORY.medical)} club(s), ชมรมวิ่งจุฬาฯ matches by category only`
  );
  console.log(`             "zzz" → ${searchCount("zzz")} club(s), empty state`);
  console.log(
    `Combine      affiliation "${AFFILIATION.nursing}" + category "${CATEGORY.music}" → empty state`
  );
  console.log(
    `Reset        jump to the last page, then type in search — it should snap back to page 1`
  );
  console.log(
    `Empty        ${affiliationTotal - byAffiliation.size} of ${affiliationTotal} affiliations have no clubs, ` +
      `and ${unaffiliated} club(s) have none at all`
  );
}

/** Every branch of the detail page has a row here, so #91 can be walked link by link. */
function printDetailHints(idsByEmail: Map<string, string>) {
  const rows: [string, string][] = [
    ["demo.thinc@example.com", "all four contact channels, 5-photo gallery"],
    ["demo.cybersec@example.com", "facebook stored as a full URL, no gallery"],
    ["demo.engvolunteer@example.com", "LINE id keeps its leading @"],
    ["demo.investment@example.com", "no shortDescription — about falls back to longDescription"],
    ["demo.boardgame@example.com", "no logo, affiliation, categories, gallery or contacts"],
    ["demo.pending@example.com", "registrationStatus PENDING → must 404"],
  ];

  // Padded to a uuid's width so the "why" column lines up, including the non-uuid row.
  const UUID_WIDTH = 36;

  console.log(`\n─── What to try on /clubs/<id> ───`);
  for (const [email, why] of rows) {
    console.log(`  /clubs/${(idsByEmail.get(email) ?? "?").padEnd(UUID_WIDTH)}  ${why}`);
  }
  console.log(`  /clubs/${"not-a-uuid".padEnd(UUID_WIDTH)}  not a uuid → must 404, never 500`);
}

async function main() {
  console.log("Seeding demo clubs...\n");

  const [affiliationRows, categoryRows] = await Promise.all([
    db.select().from(affiliations),
    db.select().from(categories),
  ]);

  if (affiliationRows.length === 0 || categoryRows.length === 0) {
    throw new Error("Missing base seed data. Run `yarn db:seed` first, then `yarn db:seed:club`.");
  }

  const lookups: Lookups = {
    affiliationByLabel: new Map(affiliationRows.map((row) => [row.label, row.id])),
    categoryByLabel: new Map(categoryRows.map((row) => [row.label, row.id])),
  };

  // Fail before writing anything if a seed row references a label the base seed does not have.
  for (const seed of clubSeeds) {
    if (seed.affiliationLabel) {
      requireId(lookups.affiliationByLabel, seed.affiliationLabel, "affiliation");
    }
    seed.categoryLabels.forEach((label) => requireId(lookups.categoryByLabel, label, "category"));
  }

  console.log("Student");
  const { created } = await ensureUser({
    email: student.email,
    name: student.name,
    role: "STUDENT",
  });
  console.log(`  ${created ? "+" : "~"} ${student.name} — ${student.email}\n`);

  console.log("Clubs");
  const idsByEmail = new Map<string, string>();
  for (const seed of clubSeeds) {
    idsByEmail.set(seed.email, await seedClub(seed, lookups));
  }

  const visible = clubSeeds.filter(
    (seed) => (seed.registrationStatus ?? "COMPLETED") === "COMPLETED"
  );
  const hidden = clubSeeds.filter((seed) => !visible.includes(seed));
  const photoCount = clubSeeds.reduce((sum, seed) => sum + seed.galleryCount, 0);

  console.log(
    `\nSeeded ${clubSeeds.length} club account(s): ${visible.length} visible, ${hidden.length} hidden.`
  );
  console.log(`Seeded ${photoCount} gallery photo(s).`);

  console.log(`\n─── Login (password for every account: ${DEMO_PASSWORD}) ───`);
  console.log(`Student    ${student.email}`);
  console.log(
    `Clubs      ${visible[0]!.email} … and ${visible.length - 1} more, all demo.<slug>@example.com`
  );
  for (const seed of hidden) {
    const status = seed.registrationStatus ?? "COMPLETED";
    console.log(
      `Hidden     ${seed.email.padEnd(32)} registrationStatus = ${status} → must NOT appear on /clubs`
    );
  }

  printHints(visible, affiliationRows.length);
  printDetailHints(idsByEmail);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
