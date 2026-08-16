import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import type {
  UpdateClubInputDTO,
  UpdateClubOutputDTO,
} from "@/server/api/modules/clubs/dto/update-user-submits-info.dto";
import { notFound } from "@/server/errors";

export const updateClub = async (input: UpdateClubInputDTO): Promise<UpdateClubOutputDTO> => {
  const { id, ...update } = input;

  await clubsRepository.updateById(id, {
    affiliationId: update.affiliationId ?? undefined,
    shortDescription: update.shortDescription ?? undefined,
    longDescription: update.longDescription ?? undefined,
    imageUrls: update.imageUrls ?? undefined,
    contacts: update.contacts ?? undefined,
    registrationStatus: update.registrationStatus ?? undefined,
  });

  const club = await clubsRepository.getById(id);
  if (!club) throw notFound("Club not found");

  return club.toDTO();
};
