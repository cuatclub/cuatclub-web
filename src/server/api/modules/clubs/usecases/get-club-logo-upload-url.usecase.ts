import {
  GetClubLogoUploadUrlOutputDTOSchema,
  type GetClubLogoUploadUrlInputDTO,
} from "@/server/api/modules/clubs/dto";
import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import { getExtension, getPublicUrl, getSignedUploadUrl } from "@/server/services/r2";
import { notFound, validationError } from "@/server/errors";

export const getClubLogoUploadUrl = async (userId: string, input: GetClubLogoUploadUrlInputDTO) => {
  const club = await clubsRepository.getByUserId(userId);
  if (!club) {
    throw notFound("Club not found for this user");
  }

  if (!club.isAwaitingProfileInformation) {
    throw validationError("Club profile information cannot be changed at this step.");
  }

  const key = `clubs/${club.id}/logo.${getExtension(input.contentType)}`;
  const url = await getSignedUploadUrl(key, input.contentType);

  return GetClubLogoUploadUrlOutputDTOSchema.parse({ key, url, publicUrl: getPublicUrl(key) });
};
