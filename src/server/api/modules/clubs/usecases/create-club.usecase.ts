import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import type {
  CreateClubInputDTO,
  CreateClubOutputDTO,
} from "@/server/api/modules/clubs/dto/create-club.dto";
import { notFound } from "@/server/errors";

export const createClub = async (input: CreateClubInputDTO): Promise<CreateClubOutputDTO> => {
  const id = await clubsRepository.create({
    userId: input.userId,
    affiliationId: input.affiliationId ?? null,
    shortDescription: input.shortDescription ?? null,
    longDescription: input.longDescription ?? null,
    imageUrls: input.imageUrls ?? [],
    contacts: input.contacts ?? null,
    registrationStatus: input.registrationStatus ?? "PENDING",
  });

  const club = await clubsRepository.getById(id);
  if (!club) throw notFound("Club not found after creation");

  return club.toDTO();
};
