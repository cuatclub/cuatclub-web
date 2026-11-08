import { studentsRepository } from "@/server/api/modules/students/repositories/students.repository";
import {
  SaveStudentReferralSourceOutputDTOSchema,
  type SaveStudentReferralSourceInputDTO,
  type SaveStudentReferralSourceOutputDTO,
} from "@/server/api/modules/students/dto";
import { notFound, validationError } from "@/server/errors";

export const saveStudentReferralSource = async (
  userId: string,
  input: SaveStudentReferralSourceInputDTO
): Promise<SaveStudentReferralSourceOutputDTO> => {
  const student = await studentsRepository.getByUserId(userId);
  if (!student) throw notFound("Student profile not found");

  if (!student.hasReached("PREFERENCES_SUBMITTED")) {
    throw validationError("Student referral source cannot be changed at this step.");
  }

  await studentsRepository.updateById(student.id, {
    referralSource: input.source,
    // The free text only means something for OTHER; drop it otherwise.
    referralOther: input.source === "OTHER" ? (input.other ?? null) : null,
    registrationStatus: "COMPLETED",
  });

  return SaveStudentReferralSourceOutputDTOSchema.parse({ registrationStatus: "COMPLETED" });
};
