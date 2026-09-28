import type { ClubProfileFormValues } from "@/features/club-profile/club-profile-schema";
import type { ClubDetailOutputDTO } from "@/server/api/modules/clubs/dto";

export function buildClubProfileFormValues(profile: ClubDetailOutputDTO): ClubProfileFormValues {
  return {
    logo: profile.logoUrl ? { kind: "persisted", url: profile.logoUrl } : null,
    name: profile.name,
    affiliation: profile.affiliation?.label ?? "",
    categories: profile.categories.map(({ label }) => label),
    shortDescription: profile.shortDescription ?? "",
    longDescription: profile.longDescription ?? "",
    atmospherePhotos: profile.imageUrls.map((url) => ({ kind: "persisted", url })),
    contacts: {
      instagram: profile.contacts?.instagram ?? "",
      facebook: profile.contacts?.facebook ?? "",
      tiktok: profile.contacts?.tiktok ?? "",
      lineOa: profile.contacts?.line_oa ?? "",
    },
  };
}
