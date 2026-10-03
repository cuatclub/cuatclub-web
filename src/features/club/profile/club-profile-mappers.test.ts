import { describe, expect, it } from "vitest";

import { buildClubProfileFormValues } from "@/features/club/profile/club-profile-mappers";
import type { ClubDetailOutputDTO } from "@/server/api/modules/clubs/dto";

const completeProfile: ClubDetailOutputDTO = {
  id: "club-id",
  name: "ชมรมตัวอย่าง",
  logoUrl: "https://cdn.example.com/logo.png",
  affiliation: { id: 1, label: "วิศวกรรมศาสตร์" },
  categories: [
    { id: 2, label: "กีฬา", fontColor: "#111111", backgroundColor: "#eeeeee" },
    { id: 1, label: "ดนตรี", fontColor: "#222222", backgroundColor: "#dddddd" },
  ],
  shortDescription: "คำอธิบายแบบย่อ",
  longDescription: "คำอธิบายแบบละเอียด",
  imageUrls: ["https://cdn.example.com/gallery-2.png", "https://cdn.example.com/gallery-1.png"],
  contacts: {
    instagram: "club-instagram",
    facebook: "club-facebook",
    tiktok: "club-tiktok",
    line_oa: "@club-line",
  },
};

describe("buildClubProfileFormValues", () => {
  it("maps persisted images, category order, and Line OA into form values", () => {
    expect(buildClubProfileFormValues(completeProfile)).toEqual({
      logo: { kind: "persisted", url: "https://cdn.example.com/logo.png" },
      name: "ชมรมตัวอย่าง",
      affiliation: "วิศวกรรมศาสตร์",
      categories: ["กีฬา", "ดนตรี"],
      shortDescription: "คำอธิบายแบบย่อ",
      longDescription: "คำอธิบายแบบละเอียด",
      atmospherePhotos: [
        { kind: "persisted", url: "https://cdn.example.com/gallery-2.png" },
        { kind: "persisted", url: "https://cdn.example.com/gallery-1.png" },
      ],
      contacts: {
        instagram: "club-instagram",
        facebook: "club-facebook",
        tiktok: "club-tiktok",
        lineOa: "@club-line",
      },
    });
  });

  it("maps nullable profile values to empty form fields", () => {
    expect(
      buildClubProfileFormValues({
        ...completeProfile,
        logoUrl: null,
        affiliation: null,
        categories: [],
        shortDescription: null,
        longDescription: null,
        imageUrls: [],
        contacts: null,
      })
    ).toEqual({
      logo: null,
      name: "ชมรมตัวอย่าง",
      affiliation: "",
      categories: [],
      shortDescription: "",
      longDescription: "",
      atmospherePhotos: [],
      contacts: { instagram: "", facebook: "", tiktok: "", lineOa: "" },
    });
  });
});
