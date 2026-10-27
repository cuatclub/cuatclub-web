import { z } from "zod";
import { StudentOutputDTOSchema } from "@/server/api/modules/students/dto/student.dto";

export type GetStudentRegistrationInputDTO = Record<string, never>;

export const GetStudentRegistrationInputDTOSchema = z.object({});

export const GetStudentRegistrationOutputDTOSchema = StudentOutputDTOSchema.extend({
  email: z.string(),
});

export type GetStudentRegistrationOutputDTO = z.infer<typeof GetStudentRegistrationOutputDTOSchema>;
