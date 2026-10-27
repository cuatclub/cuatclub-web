import { unitOfWork } from "@/server/db/unit-of-work";
import { studentsRepository } from "@/server/api/modules/students/repositories/students.repository";
import { studentCategoriesRepository } from "@/server/api/modules/students/repositories/student-categories.repository";
import { studentActivityTypesRepository } from "@/server/api/modules/students/repositories/student-activity-types.repository";
import {
  SaveStudentPreferencesOutputDTOSchema,
  type SaveStudentPreferencesInputDTO,
  type SaveStudentPreferencesOutputDTO,
} from "@/server/api/modules/students/dto";
import { notFound, validationError } from "@/server/errors";

export const saveStudentPreferences = async (
  userId: string,
  input: SaveStudentPreferencesInputDTO
): Promise<SaveStudentPreferencesOutputDTO> => {
  const student = await studentsRepository.getByUserId(userId);
  if (!student) throw notFound("Student profile not found");

  if (!student.hasReached("GENERAL_SUBMITTED")) {
    throw validationError("Student preferences cannot be changed at this step.");
  }

  const registrationStatus = student.statusAfter("PREFERENCES_SUBMITTED");
  await unitOfWork.run(async (client) => {
    await studentCategoriesRepository.replaceByStudentId(student.id, input.categoryIds, client);
    await studentActivityTypesRepository.replaceByStudentId(
      student.id,
      input.activityTypeIds,
      client
    );
    await studentsRepository.updateById(student.id, { registrationStatus }, client);
  });

  return SaveStudentPreferencesOutputDTOSchema.parse({ registrationStatus });
};
