import { z } from "zod";
import { StudentOutputDTOSchema } from "@/server/api/modules/students/dto/student.dto";

export type GetStudentRegistrationInputDTO = Record<string, never>;

export const GetStudentRegistrationInputDTOSchema = z.object({});

export const GetStudentRegistrationOutputDTOSchema = StudentOutputDTOSchema.extend({
  email: z.string(),
  image: z.string().nullable(),
});

export type GetStudentRegistrationOutputDTO = z.infer<typeof GetStudentRegistrationOutputDTOSchema>;
