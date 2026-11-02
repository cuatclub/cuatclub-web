import { studentsRepository } from "@/server/api/modules/students/repositories/students.repository";
import { usersRepository } from "@/server/api/modules/users/repositories/users.repository";
import { studentProfileImagePrefix } from "@/server/api/modules/students/entities/student.entity";
import {
  SaveStudentGeneralInfoOutputDTOSchema,
  type SaveStudentGeneralInfoInputDTO,
  type SaveStudentGeneralInfoOutputDTO,
} from "@/server/api/modules/students/dto";
import { unitOfWork } from "@/server/db/unit-of-work";
import { deleteImageWithinPrefix, isKeyWithinPrefix, toR2Key } from "@/server/services/r2";
import { conflict, notFound, validationError } from "@/server/errors";

export const saveStudentGeneralInfo = async (
  userId: string,
  input: SaveStudentGeneralInfoInputDTO
): Promise<SaveStudentGeneralInfoOutputDTO> => {
  const { university, image, ...rest } = input;

  const student = await studentsRepository.getByUserId(userId);
  if (!student) throw notFound("Student profile not found");

  const sameUsername = await studentsRepository.getByUsername(input.username);
  if (sameUsername && sameUsername.id !== student.id) {
    throw conflict("This username is already taken.");
  }

  // The URL comes from the client, so only accept one inside this student's own folder.
  const imagePrefix = studentProfileImagePrefix(userId);
  if (image && !isKeyWithinPrefix(toR2Key(image), imagePrefix)) {
    throw validationError("Invalid profile image.");
  }
  const previousImage = image ? ((await usersRepository.getById(userId))?.image ?? null) : null;

  const registrationStatus = student.statusAfter("GENERAL_SUBMITTED");
  await unitOfWork.run(async (client) => {
    await studentsRepository.updateById(
      student.id,
      {
        ...rest,
        // Chula students have no university to record; drop any stray value.
        university: input.status === "OTHER_UNIVERSITY" ? (university ?? null) : null,
        registrationStatus,
      },
      client
    );
    if (image) await usersRepository.updateById(userId, { image }, client);
  });

  // Not part of the transaction: a failed cleanup must not undo the saved profile.
  if (image && previousImage && previousImage !== image) {
    await deleteImageWithinPrefix(previousImage, imagePrefix);
  }

  return SaveStudentGeneralInfoOutputDTOSchema.parse({ registrationStatus });
};
