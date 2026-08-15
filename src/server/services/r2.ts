import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { env } from "@/env";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
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

export function getPublicUrl(key: string): string {
	const base = env.R2_PUBLIC_BASE_URL.replace(/\/$/, "");
	return `${base}/${key}`;
}

export async function uploadImage(
	buffer: Buffer,
	contentType: string,
	key?: string,
): Promise<string> {
	if (!ALLOWED_TYPES.includes(contentType as (typeof ALLOWED_TYPES)[number])) {
		throw new Error(`Unsupported image type: ${contentType}`);
	}
	const ext = EXT_MAP[contentType] ?? "jpg";
	const objectKey = key ?? `images/${randomUUID()}.${ext}`;

	await client.send(
		new PutObjectCommand({
			Bucket: env.R2_BUCKET,
			Key: objectKey,
			Body: buffer,
			ContentType: contentType,
		}),
	);

	return getPublicUrl(objectKey);
}
