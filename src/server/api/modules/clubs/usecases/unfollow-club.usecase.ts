import { clubFollowsRepository } from "@/server/api/modules/clubs/repositories/club-follows.repository";
import { studentsRepository } from "@/server/api/modules/students/repositories/students.repository";
import type { UnfollowClubInputDTO, UnfollowClubOutputDTO } from "@/server/api/modules/clubs/dto";
import { forbidden } from "@/server/errors";

export const unfollowClub = async (
  userId: string,
  input: UnfollowClubInputDTO
): Promise<UnfollowClubOutputDTO> => {
  const student = await studentsRepository.getByUserId(userId);
  if (student?.registrationStatus !== "COMPLETED") {
    throw forbidden("Complete your student profile before following clubs");
  }

  await clubFollowsRepository.unfollow(student.id, input.clubId);
  return { isFollowing: false };
};
