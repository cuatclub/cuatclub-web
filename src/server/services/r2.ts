import { DeleteObjectsCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/config/env";

export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const client = new S3Client({
  region: "auto",
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

export function getExtension(contentType: string): string {
  return EXT_MAP[contentType] ?? "jpg";
}

export function getPublicUrl(key: string): string {
  const base = env.R2_PUBLIC_BASE_URL.replace(/\/$/, "");
  return `${base}/${key}`;
}

// Inverse of getPublicUrl; returns the input unchanged if it isn't under the public base URL.
export function toR2Key(url: string): string {
  const base = env.R2_PUBLIC_BASE_URL.replace(/\/$/, "");
  return url.startsWith(`${base}/`) ? url.slice(base.length + 1) : url;
}

/**
 * Whether `key` is inside `prefix` (e.g. a club's folder); rejects `..` so traversal
 * can't escape it.
 */
export function isKeyWithinPrefix(key: string, prefix: string): boolean {
  return key.startsWith(prefix) && !key.includes("..");
}

export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 60,
  contentLength?: number
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: key,
    ContentType: contentType,
    // When provided, the byte count is folded into the signature, so R2 rejects
    // any upload whose Content-Length does not match exactly.
    ...(contentLength !== undefined ? { ContentLength: contentLength } : {}),
  });

  return getSignedUrl(client, command, { expiresIn });
}

export async function deleteImages(
  keys: string[]
): Promise<{ deleted: string[]; errors: string[] }> {
  const command = new DeleteObjectsCommand({
    Bucket: env.R2_BUCKET,
    Delete: {
      Objects: keys.map((Key) => ({ Key })),
      Quiet: false,
    },
  });

  const response = await client.send(command);

  return {
    deleted: (response.Deleted ?? []).map((obj) => obj.Key!),
    errors: (response.Errors ?? []).map((err) => `${err.Key}: ${err.Message}`),
  };
}

/**
 * Best-effort cleanup of one stored image, for use after the caller's real write has committed:
 * a failure is logged, never thrown, so it can't turn that success into an error response. The
 * URL is usually client-supplied, so nothing outside `allowedPrefix` is ever deleted.
 */
export async function deleteImageWithinPrefix(url: string, allowedPrefix: string): Promise<void> {
  const key = toR2Key(url);
  if (!isKeyWithinPrefix(key, allowedPrefix)) return;

  try {
    const { errors } = await deleteImages([key]);
    if (errors.length > 0) console.error("r2: image cleanup returned errors", { key, errors });
  } catch (error) {
    console.error("r2: image cleanup failed", { key, error });
  }
}
