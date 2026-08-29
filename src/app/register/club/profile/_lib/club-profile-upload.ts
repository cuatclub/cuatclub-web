import type { ClubImageContentType } from "@/app/register/club/profile/profile-schema";

type ClubImageUploadTarget = {
  url: string;
  contentType: ClubImageContentType;
};

export async function uploadClubImage(
  file: File,
  { url, contentType }: ClubImageUploadTarget
): Promise<void> {
  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
    credentials: "omit",
  });

  if (!response.ok) {
    throw new Error("Club image upload failed");
  }
}
