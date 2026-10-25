import { studentsRepository } from "@/server/api/modules/students/repositories/students.repository";
import { usersRepository } from "@/server/api/modules/users/repositories/users.repository";
import type { GetStudentRegistrationOutputDTO } from "@/server/api/modules/students/dto";
import { notFound, internalError } from "@/server/errors";

export const getStudentRegistration = async (
  currentUserId: string
): Promise<GetStudentRegistrationOutputDTO> => {
  const user = await usersRepository.getById(currentUserId);
  if (user?.role !== "STUDENT") throw notFound("Student profile not found");

  // Google sign-in creates the user row without going through registerStudent, so the
  // student row is created lazily the first time the registration flow looks for it.
  let student = await studentsRepository.getByUserId(currentUserId);
  if (!student) {
    await studentsRepository.create({ userId: currentUserId, registrationStatus: "PENDING" });
    student = await studentsRepository.getByUserId(currentUserId);
  }
  if (!student) {
    throw internalError({
      reason: "Student row could not be read back after creation",
      userId: currentUserId,
    });
  }

  return { ...student.toDTO(), email: user.email };
};
