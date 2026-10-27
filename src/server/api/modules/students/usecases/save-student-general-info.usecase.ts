import { studentsRepository } from "@/server/api/modules/students/repositories/students.repository";
import {
  SaveStudentGeneralInfoOutputDTOSchema,
  type SaveStudentGeneralInfoInputDTO,
  type SaveStudentGeneralInfoOutputDTO,
} from "@/server/api/modules/students/dto";
import { conflict, notFound } from "@/server/errors";

export const saveStudentGeneralInfo = async (
  userId: string,
  input: SaveStudentGeneralInfoInputDTO
): Promise<SaveStudentGeneralInfoOutputDTO> => {
  const { university, ...rest } = input;

  const student = await studentsRepository.getByUserId(userId);
  if (!student) throw notFound("Student profile not found");

  const sameUsername = await studentsRepository.getByUsername(input.username);
  if (sameUsername && sameUsername.id !== student.id) {
    throw conflict("This username is already taken.");
  }

  const registrationStatus = student.statusAfter("GENERAL_SUBMITTED");
  await studentsRepository.updateById(student.id, {
    ...rest,
    // Chula students have no university to record; drop any stray value.
    university: input.status === "OTHER_UNIVERSITY" ? (university ?? null) : null,
    registrationStatus,
  });

  return SaveStudentGeneralInfoOutputDTOSchema.parse({ registrationStatus });
};
