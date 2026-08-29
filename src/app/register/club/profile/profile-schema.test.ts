import { describe, expect, it } from "vitest";

import {
  AFFILIATION_REQUIRED_MESSAGE,
  ATMOSPHERE_PHOTOS_MAX_MESSAGE,
  CATEGORIES_REQUIRED_MESSAGE,
  CATEGORIES_UNIQUE_MESSAGE,
  CLUB_NAME_REQUIRED_MESSAGE,
  clubProfileSchema,
  IMAGE_SIZE_MESSAGE,
  IMAGE_TYPE_MESSAGE,
  LOGO_REQUIRED_MESSAGE,
  LONG_DESCRIPTION_REQUIRED_MESSAGE,
  MAX_IMAGE_FILE_SIZE,
  SHORT_DESCRIPTION_MAX_MESSAGE,
  SHORT_DESCRIPTION_REQUIRED_MESSAGE,
} from "@/app/register/club/profile/profile-schema";

const makeFileMetadata = (name: string, type: string, size = 1) => ({ name, type, size });

const validInput = {
  logo: makeFileMetadata("logo.png", "image/png"),
  name: "ชมรมตัวอย่าง",
  affiliation: "วิศวกรรมศาสตร์",
  categories: ["เทคโนโลยี"],
  shortDescription: "คำอธิบายชมรมแบบย่อ",
  longDescription: "คำอธิบายชมรมแบบละเอียด",
  atmospherePhotos: [],
  contacts: {
    instagram: "",
    facebook: "",
    tiktok: "",
    lineOa: "",
  },
};

function expectIssue(value: unknown, path: string, message: string) {
  const result = clubProfileSchema.safeParse(value);
  expect(result.success).toBe(false);
  if (result.success) return;

  expect(
    result.error.issues.some(
      (issue) => issue.path.map(String).join(".") === path && issue.message === message
    )
  ).toBe(true);
}

describe("clubProfileSchema", () => {
  it("accepts a completely valid form value", () => {
    expect(clubProfileSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects every missing required field with its intended message", () => {
    expectIssue({ ...validInput, logo: null }, "logo", LOGO_REQUIRED_MESSAGE);
    expectIssue({ ...validInput, name: "   " }, "name", CLUB_NAME_REQUIRED_MESSAGE);
    expectIssue({ ...validInput, affiliation: "" }, "affiliation", AFFILIATION_REQUIRED_MESSAGE);
    expectIssue({ ...validInput, categories: [] }, "categories", CATEGORIES_REQUIRED_MESSAGE);
    expectIssue(
      { ...validInput, shortDescription: " " },
      "shortDescription",
      SHORT_DESCRIPTION_REQUIRED_MESSAGE
    );
    expectIssue(
      { ...validInput, longDescription: "" },
      "longDescription",
      LONG_DESCRIPTION_REQUIRED_MESSAGE
    );
  });

  it("accepts a 180-character short description and rejects 181 characters", () => {
    expect(
      clubProfileSchema.safeParse({ ...validInput, shortDescription: "ก".repeat(180) }).success
    ).toBe(true);
    expectIssue(
      { ...validInput, shortDescription: "ก".repeat(181) },
      "shortDescription",
      SHORT_DESCRIPTION_MAX_MESSAGE
    );
  });

  it.each([
    ["image.png", "image/png"],
    ["image.jpg", "image/jpeg"],
    ["image.jpeg", "image/jpeg"],
    ["image.heic", "image/heic"],
    ["IMAGE.PNG", ""],
    ["IMAGE.JPG", ""],
    ["IMAGE.JPEG", ""],
    ["IMAGE.HEIC", ""],
  ])("accepts supported image metadata for %s", (name, type) => {
    expect(
      clubProfileSchema.safeParse({ ...validInput, logo: makeFileMetadata(name, type) }).success
    ).toBe(true);
  });

  it("rejects unsupported MIME types and extensions", () => {
    expectIssue(
      { ...validInput, logo: makeFileMetadata("image.gif", "image/gif") },
      "logo",
      IMAGE_TYPE_MESSAGE
    );
    expectIssue(
      { ...validInput, logo: makeFileMetadata("image.png", "image/webp") },
      "logo",
      IMAGE_TYPE_MESSAGE
    );
    expectIssue(
      { ...validInput, logo: makeFileMetadata("image.svg", "") },
      "logo",
      IMAGE_TYPE_MESSAGE
    );
  });

  it("rejects files above 10 MiB", () => {
    expectIssue(
      {
        ...validInput,
        logo: makeFileMetadata("image.png", "image/png", MAX_IMAGE_FILE_SIZE + 1),
      },
      "logo",
      IMAGE_SIZE_MESSAGE
    );
  });

  it("accepts zero and five atmosphere photos and rejects six", () => {
    expect(clubProfileSchema.safeParse({ ...validInput, atmospherePhotos: [] }).success).toBe(true);

    const fivePhotos = Array.from({ length: 5 }, (_, index) =>
      makeFileMetadata(`photo-${index}.jpg`, "image/jpeg")
    );
    expect(
      clubProfileSchema.safeParse({ ...validInput, atmospherePhotos: fivePhotos }).success
    ).toBe(true);
    expectIssue(
      {
        ...validInput,
        atmospherePhotos: [...fivePhotos, makeFileMetadata("photo-6.jpg", "image/jpeg")],
      },
      "atmospherePhotos",
      ATMOSPHERE_PHOTOS_MAX_MESSAGE
    );
  });

  it("rejects duplicate categories", () => {
    expectIssue(
      { ...validInput, categories: ["กีฬา", "กีฬา"] },
      "categories",
      CATEGORIES_UNIQUE_MESSAGE
    );
  });

  it("accepts empty contact fields", () => {
    expect(clubProfileSchema.safeParse(validInput).success).toBe(true);
  });
});
