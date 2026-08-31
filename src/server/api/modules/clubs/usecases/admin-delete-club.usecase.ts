import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import { unitOfWork } from "@/server/db/unit-of-work";
import { notFound } from "@/server/errors";
import { deleteImages } from "@/server/services/r2";
import { env } from "@/config/env";
import type {
  AdminDeleteClubInputDTO,
  AdminDeleteClubOutputDTO,
} from "@/server/api/modules/clubs/dto";

const toR2Key = (url: string): string => {
  const base = env.R2_PUBLIC_BASE_URL.replace(/\/$/, "");
  return url.startsWith(`${base}/`) ? url.slice(base.length + 1) : url;
};

export const adminDeleteClub = async (
  input: AdminDeleteClubInputDTO
): Promise<AdminDeleteClubOutputDTO> => {
  const detail = await clubsRepository.getDetailById(input.id);
  if (!detail) throw notFound("Club not found");

  const keys = [detail.logoUrl, ...detail.imageUrls]
    .filter((url): url is string => Boolean(url))
    .map(toR2Key);

  await unitOfWork.run(async (client) => {
    await clubsRepository.deleteById(input.id, client);
  });

  if (keys.length > 0) {
    await deleteImages(keys);
  }

  return { success: true };
};
