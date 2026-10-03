import { randomUUID } from "crypto";
import {
  GetClubLogoUploadUrlOutputDTOSchema,
  type GetClubLogoUploadUrlInputDTO,
} from "@/server/api/modules/clubs/dto";
import { clubsRepository } from "@/server/api/modules/clubs/repositories/clubs.repository";
import { getExtension, getPublicUrl, getSignedUploadUrl } from "@/server/services/r2";
import { notFound, validationError } from "@/server/errors";

export const getClubLogoUploadUrl = async (userId: string, input: GetClubLogoUploadUrlInputDTO) => {
  const club = await clubsRepository.getByUserId(userId);
  if (!club) {
    throw notFound("Club not found for this user");
  }

  if (!club.canUploadProfileImages) {
    throw validationError("Club profile images cannot be changed at this step.");
  }

  const key = `clubs/${club.id}/logo-${randomUUID()}.${getExtension(input.contentType)}`;
  const url = await getSignedUploadUrl(key, input.contentType, undefined, input.contentLength);

  return GetClubLogoUploadUrlOutputDTOSchema.parse({ key, url, publicUrl: getPublicUrl(key) });
};
