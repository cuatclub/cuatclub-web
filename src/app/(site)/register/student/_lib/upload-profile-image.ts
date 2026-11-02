import type { ProfileImageContentType } from "@/app/(site)/register/student/student-general-schema";

type ProfileImageUploadTarget = {
  url: string;
  contentType: ProfileImageContentType;
};

// Same shape as the club upload helper (features/club/profile/club-profile-upload.ts):
// PUT the raw bytes to the R2 presigned URL, no credentials.
export async function uploadProfileImage(
  file: File,
  { url, contentType }: ProfileImageUploadTarget
): Promise<void> {
  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
    credentials: "omit",
  });

  if (!response.ok) {
    throw new Error("Profile image upload failed");
  }
}
