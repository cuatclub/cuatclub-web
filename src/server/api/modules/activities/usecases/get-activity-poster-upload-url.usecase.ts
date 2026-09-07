import { randomUUID } from "crypto";
import {
  GetActivityPosterUploadUrlOutputDTOSchema,
  type GetActivityPosterUploadUrlInputDTO,
} from "@/server/api/modules/activities/dto";
import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import { getExtension, getPublicUrl, getSignedUploadUrl } from "@/server/services/r2";
import { notFound, validationError } from "@/server/errors";

export const getActivityPosterUploadUrl = async (
  userId: string,
  input: GetActivityPosterUploadUrlInputDTO
) => {
  const club = await clubsRepository.getByUserId(userId);
  if (!club) {
    throw notFound("Club not found for this user");
  }

  if (!club.isPubliclyVisible) {
    throw validationError("Only a fully registered club can publish an activity post.");
  }

  const key = `clubs/${club.id}/activities/${randomUUID()}.${getExtension(input.contentType)}`;
  const url = await getSignedUploadUrl(key, input.contentType);

  return GetActivityPosterUploadUrlOutputDTOSchema.parse({
    key,
    url,
    publicUrl: getPublicUrl(key),
  });
};
