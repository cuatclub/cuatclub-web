import { clubFollowsRepository } from "@/server/api/modules/clubs/repositories/club-follows.repository";
import { clubsRepository } from "@/server/api/modules/clubs/repositories/clubs.repository";
import { studentsRepository } from "@/server/api/modules/students/repositories/students.repository";
import type { FollowClubInputDTO, FollowClubOutputDTO } from "@/server/api/modules/clubs/dto";
import { forbidden, notFound } from "@/server/errors";

export const followClub = async (
  userId: string,
  input: FollowClubInputDTO
): Promise<FollowClubOutputDTO> => {
  const student = await studentsRepository.getByUserId(userId);
  if (student?.registrationStatus !== "COMPLETED") {
    throw forbidden("Complete your student profile before following clubs");
  }

  const club = await clubsRepository.getById(input.clubId);
  if (!club?.isPubliclyVisible) throw notFound("Club not found");

  await clubFollowsRepository.follow(student.id, input.clubId);
  return { isFollowing: true };
};
