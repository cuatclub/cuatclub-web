import { createTransactionAuth } from "@/server/auth";
import { unitOfWork } from "@/server/db/unit-of-work";
import { studentsRepository } from "@/server/api/modules/students/repositories/students.repository";
import { usersRepository } from "@/server/api/modules/users/repositories/users.repository";
import {
  RegisterStudentOutputDTOSchema,
  type RegisterStudentInputDTO,
  type RegisterStudentOutputDTO,
} from "@/server/api/modules/students/dto";
import { conflict } from "@/server/errors";

export const registerStudent = async (
  input: RegisterStudentInputDTO
): Promise<RegisterStudentOutputDTO> => {
  const existingUser = await usersRepository.getByEmail(input.email);
  if (existingUser) {
    throw conflict("This email is already registered.");
  }

  const { studentId, userId } = await unitOfWork.run(async (client) => {
    // better-auth's signUpEmail requires a non-empty `name`; the email is just a placeholder
    // here. `role` already defaults to STUDENT in the DB, so no role update is needed.
    const { user } = await createTransactionAuth(client).api.signUpEmail({
      body: {
        email: input.email,
        password: input.password,
        name: input.email,
      },
    });

    const studentId = await studentsRepository.create(
      { userId: user.id, registrationStatus: "PENDING" },
      client
    );

    return { studentId, userId: user.id };
  });

  return RegisterStudentOutputDTOSchema.parse({
    id: studentId,
    userId,
    email: input.email,
    registrationStatus: "PENDING",
  });
};
