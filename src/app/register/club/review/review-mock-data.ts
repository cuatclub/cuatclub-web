import type { GetClubByIdOutputDTO } from "@/server/api/modules/clubs/dto";

export const MOCK_REVIEW_REGISTRATION_STATUS = "INFO_SUBMITTED" as const;

export const MOCK_CLUB_REGISTRATION_REVIEW = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Thinc.",
  logoUrl: "https://placehold.co/200x200/DD598C/FFFFFF/png?text=Thinc.",
  affiliation: { id: 1, label: "วิศวกรรมศาสตร์" },
  categories: [
    { id: 1, label: "เทคโนโลยี", fontColor: "#0891B2", backgroundColor: "#CFFAFE" },
    { id: 2, label: "ธุรกิจ", fontColor: "#9333EA", backgroundColor: "#F3E8FF" },
  ],
  shortDescription: "A concise mock club description.",
  longDescription:
    "A longer multi-sentence mock description used to verify wrapping and spacing. It gives prospective members a clearer picture of the club's activities and community.",
  imageUrls: [
    "https://placehold.co/800x600/DD598C/FFFFFF/png?text=Thinc+1",
    "https://placehold.co/800x600/0891B2/FFFFFF/png?text=Thinc+2",
    "https://placehold.co/800x600/9333EA/FFFFFF/png?text=Thinc+3",
    "https://placehold.co/800x600/EA580C/FFFFFF/png?text=Thinc+4",
    "https://placehold.co/800x600/16A34A/FFFFFF/png?text=Thinc+5",
  ],
  contacts: {
    instagram: "thinc.th",
    facebook: "Thinc.",
    tiktok: "Thinc.",
    line_oa: "@thinc.th",
  },
} satisfies GetClubByIdOutputDTO;

export const MOCK_CLUB_REGISTRATION_REVIEW_WITHOUT_OPTIONAL_DATA = {
  ...MOCK_CLUB_REGISTRATION_REVIEW,
  logoUrl: null,
  affiliation: null,
  imageUrls: [],
  contacts: null,
} satisfies GetClubByIdOutputDTO;
