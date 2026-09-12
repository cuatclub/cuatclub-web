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

// Inverse of getPublicUrl — strips the public base URL back down to the R2 object
// key, e.g. before passing a stored *Url column to deleteImages(). Returns the
// input unchanged if it doesn't start with the configured base.
export function toR2Key(url: string): string {
  const base = env.R2_PUBLIC_BASE_URL.replace(/\/$/, "");
  return url.startsWith(`${base}/`) ? url.slice(base.length + 1) : url;
}

/**
 * Whether an object key sits inside the given prefix, e.g. one club's own upload
 * folder. `*Url` columns are written from client input, so a caller can name any
 * object it likes — check the key before deleting anything derived from one, or a
 * post can be pointed at another club's image and made to delete it. `..` is
 * rejected so a traversal segment can't walk back out of the prefix.
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
