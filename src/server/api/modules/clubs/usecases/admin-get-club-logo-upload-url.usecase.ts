import {
  AdminGetClubLogoUploadUrlOutputDTOSchema,
  type AdminGetClubLogoUploadUrlInputDTO,
} from "@/server/api/modules/clubs/dto";
import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import { getExtension, getPublicUrl, getSignedUploadUrl } from "@/server/services/r2";
import { notFound } from "@/server/errors";

export const adminGetClubLogoUploadUrl = async (input: AdminGetClubLogoUploadUrlInputDTO) => {
  const club = await clubsRepository.getById(input.clubId);
  if (!club) throw notFound("Club not found");

  const key = `clubs/${club.id}/logo.${getExtension(input.contentType)}`;
  const url = await getSignedUploadUrl(key, input.contentType);

  return AdminGetClubLogoUploadUrlOutputDTOSchema.parse({ key, url, publicUrl: getPublicUrl(key) });
};
