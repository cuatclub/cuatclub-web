import type { PosterImageContentType } from "@/app/(site)/club/dashboard/posts/post-schema";

type PosterUploadTarget = {
  url: string;
  contentType: PosterImageContentType;
};

// Same shape as the club-registration upload helper
// (register/club/profile/_lib/club-profile-upload.ts): PUT the raw bytes to the
// R2 presigned URL, no credentials.
export async function uploadActivityPoster(
  file: File,
  { url, contentType }: PosterUploadTarget
): Promise<void> {
  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
    credentials: "omit",
  });

  if (!response.ok) {
    throw new Error("Activity poster upload failed");
  }
}
