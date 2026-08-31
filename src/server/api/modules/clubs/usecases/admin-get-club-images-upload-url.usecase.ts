import { randomUUID } from "crypto";
import {
  AdminGetClubImagesUploadUrlOutputDTOSchema,
  type AdminGetClubImagesUploadUrlInputDTO,
} from "@/server/api/modules/clubs/dto";
import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import { getExtension, getPublicUrl, getSignedUploadUrl } from "@/server/services/r2";
import { notFound } from "@/server/errors";

export const adminGetClubImagesUploadUrl = async (input: AdminGetClubImagesUploadUrlInputDTO) => {
  const club = await clubsRepository.getById(input.clubId);
  if (!club) throw notFound("Club not found");

  const presignedUrls = await Promise.all(
    input.files.map(async (file, index) => {
      const key = `clubs/${club.id}/${randomUUID()}${index}.${getExtension(file.contentType)}`;
      const url = await getSignedUploadUrl(key, file.contentType);
      return { key, url, publicUrl: getPublicUrl(key) };
    })
  );

  return AdminGetClubImagesUploadUrlOutputDTOSchema.parse({ presignedUrls });
};
