import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import { usersRepository } from "@/server/api/modules/users/users.repository";
import type { GetClubProfileOutputDTO } from "@/server/api/modules/clubs/dto";
import { notFound, internalError } from "@/server/errors";

export const getClubProfile = async (currentUserId: string): Promise<GetClubProfileOutputDTO> => {
  const club = await clubsRepository.getByUserId(currentUserId);
  if (!club) throw notFound("Club profile not found");

  const user = await usersRepository.getById(currentUserId);
  if (!user)
    throw internalError({
      reason: "Club exists but owning user could not be found",
      userId: currentUserId,
    });

  return { ...club.toDTO(), email: user.email, role: user.role };
};
