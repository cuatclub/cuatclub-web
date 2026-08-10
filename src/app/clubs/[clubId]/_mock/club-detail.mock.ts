/**
 * TEMPORARY stand-in for the public club-detail endpoint, which does not exist yet.
 *
 * `ClubDetail` deliberately mirrors the DTO that endpoint is expected to return, so
 * swapping this out is a one-line change in `page.tsx`:
 *
 *   const club = await getMockClubById(clubId);
 *   const club = await api.clubs.getById({ clubId });
 *
 * Note that `clubs.getClubProfile` cannot serve this page today — it is a
 * `protectedProcedure` keyed on the signed-in user rather than a club id, and its
 * output carries neither the club name/logo (both live on `user`) nor the resolved
 * affiliation label and category rows.
 */

export type ClubContactChannel = "instagram" | "facebook" | "tiktok" | "line_oa";

export type ClubCategory = {
  id: number;
  label: string;
  fontColor: string;
  backgroundColor: string;
};

export type ClubAffiliation = {
  id: number;
  label: string;
};

export type ClubDetail = {
  id: string;
  /** `user.name` of the owning account. */
  name: string;
  /** `user.image` of the owning account. */
  logoUrl: string | null;
  affiliation: ClubAffiliation | null;
  categories: ClubCategory[];
  shortDescription: string | null;
  longDescription: string | null;
  imageUrls: string[];
  contacts: Partial<Record<ClubContactChannel, string>> | null;
};

const THINC_ABOUT =
  "Thinc is a student builder community at Chula Engineering that has been shipping real " +
  "software to the market and spinning out startups since 2012. We exist because we believe a " +
  "lot of students could build something people genuinely use, but they never get the team, the " +
  "real problem, or the push to start. So we put you in a small team, help you find a real " +
  "problem with real users, and you build it, test it with those users, and keep fixing it " +
  "until it works, with alumni around to help. Our club has grown real startups like Viabus and " +
  "shipped apps like CUpid and CUGetReg that thousands of students actually use, and we also " +
  "take on paid client work that keeps the club running. You walk out knowing how to turn an " +
  "idea into something real.";

// placehold.co is already allow-listed in next.config.js, so mock photos render
// through next/image without touching the image config.
const mockPhoto = (seed: string) => `https://placehold.co/960x720/f8dee8/dd598c/png?text=${seed}`;

const MOCK_CLUBS: ClubDetail[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Thinc.",
    logoUrl: "https://placehold.co/256x256/dd598c/ffffff/png?text=Thinc.",
    affiliation: { id: 1, label: "วิศวกรรมศาสตร์" },
    categories: [
      { id: 1, label: "เทคโนโลยี", fontColor: "#0891b2", backgroundColor: "#cffafe" },
      { id: 2, label: "ธุรกิจ", fontColor: "#9333ea", backgroundColor: "#f3e8ff" },
    ],
    shortDescription:
      "ชุมชนนักสร้างของนิสิตวิศวฯ จุฬาฯ ที่ปั้นซอฟต์แวร์และสตาร์ทอัพจริงตั้งแต่ปี 2012",
    longDescription: THINC_ABOUT,
    imageUrls: [
      mockPhoto("Photo+1"),
      mockPhoto("Photo+2"),
      mockPhoto("Photo+3"),
      mockPhoto("Photo+4"),
      mockPhoto("Photo+5"),
    ],
    contacts: {
      instagram: "thinc.th",
      facebook: "Thinc.",
      tiktok: "Thinc.",
      line_oa: "@thinc.th",
    },
  },
  // Sparse club — exercises every empty state (no logo, affiliation, tags, photos or contacts).
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "ชมรมถ่ายภาพ",
    logoUrl: null,
    affiliation: null,
    categories: [],
    shortDescription: null,
    longDescription: null,
    imageUrls: [],
    contacts: null,
  },
];

/**
 * Async on purpose: keeps the call site identical to the tRPC query that replaces it.
 */
export const getMockClubById = async (clubId: string): Promise<ClubDetail | null> =>
  MOCK_CLUBS.find((club) => club.id === clubId) ?? null;
