import { z } from "zod";
import { StudentOutputDTOSchema } from "@/server/api/modules/students/dto/student.dto";
import {
  PASSWORDS_MISMATCH_ISSUE,
  passwordsMatch,
  RegisterCredentialsFieldsSchema,
} from "@/server/api/modules/users/dto/register-credentials.dto";

export const RegisterStudentInputDTOSchema = RegisterCredentialsFieldsSchema.refine(
  passwordsMatch,
  PASSWORDS_MISMATCH_ISSUE
);

export type RegisterStudentInputDTO = z.infer<typeof RegisterStudentInputDTOSchema>;

export const RegisterStudentOutputDTOSchema = StudentOutputDTOSchema.pick({
  id: true,
  userId: true,
  registrationStatus: true,
}).extend({
  email: z.string(),
});

export type RegisterStudentOutputDTO = z.infer<typeof RegisterStudentOutputDTOSchema>;
