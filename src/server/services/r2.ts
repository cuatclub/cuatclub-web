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

export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 60
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: key,
    ContentType: contentType,
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
