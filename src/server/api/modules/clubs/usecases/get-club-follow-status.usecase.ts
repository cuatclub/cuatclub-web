import { clubFollowsRepository } from "@/server/api/modules/clubs/repositories/club-follows.repository";
import { clubsRepository } from "@/server/api/modules/clubs/repositories/clubs.repository";
import { studentsRepository } from "@/server/api/modules/students/repositories/students.repository";
import type {
  GetClubFollowStatusInputDTO,
  GetClubFollowStatusOutputDTO,
} from "@/server/api/modules/clubs/dto";
import { forbidden, notFound } from "@/server/errors";

export const getClubFollowStatus = async (
  userId: string,
  input: GetClubFollowStatusInputDTO
): Promise<GetClubFollowStatusOutputDTO> => {
  const student = await studentsRepository.getByUserId(userId);
  if (student?.registrationStatus !== "COMPLETED") {
    throw forbidden("Complete your student profile before following clubs");
  }

  const club = await clubsRepository.getById(input.clubId);
  if (!club?.isPubliclyVisible) throw notFound("Club not found");

  return { isFollowing: await clubFollowsRepository.isFollowing(student.id, input.clubId) };
};
