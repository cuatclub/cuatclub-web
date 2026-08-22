import {
  GetPresignedUrlsOutputDTOSchema,
  type GetPresignedUrlsInputDTO,
} from "@/server/api/modules/s3/dto/index";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { client } from "@/server/services/r2";
import { usersRepository } from "@/server/api/modules/users/users.repository";

export const getPresignedUrls = async (userId: string, input: GetPresignedUrlsInputDTO) => {
  const urls = await Promise.all(
    input.files.map(async (file) => {
      const user = await usersRepository.getById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const fileKey = `uploads/${userId}/${Date.now()}-${file.filename}`;

      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: fileKey,
        ContentType: file.contentType,
        ContentLength: file.size,
      });

      const signedUrl = await getSignedUrl(client, command, { expiresIn: 60 });

      return {
        originalName: file.filename,
        fileKey,
        url: signedUrl,
      };
    })
  );
  return GetPresignedUrlsOutputDTOSchema.parse({ presignedUrls: urls });
};
