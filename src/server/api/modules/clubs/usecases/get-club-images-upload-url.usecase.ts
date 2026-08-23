import {
  GetClubImagesUploadUrlOutputDTOSchema,
  type GetClubImagesUploadUrlInputDTO,
} from "@/server/api/modules/clubs/dto";
import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import { getExtension, getPublicUrl, getSignedUploadUrl } from "@/server/services/r2";
import { notFound } from "@/server/errors";

export const getClubImagesUploadUrl = async (
  userId: string,
  input: GetClubImagesUploadUrlInputDTO
) => {
  const club = await clubsRepository.getByUserId(userId);
  if (!club) {
    throw notFound("Club not found for this user");
  }

  const presignedUrls = await Promise.all(
    input.files.map(async (file, index) => {
      const key = `clubs/${club.id}/image${index + 1}.${getExtension(file.contentType)}`;
      const url = await getSignedUploadUrl(key, file.contentType);
      return { key, url, publicUrl: getPublicUrl(key) };
    })
  );

  return GetClubImagesUploadUrlOutputDTOSchema.parse({ presignedUrls });
};
