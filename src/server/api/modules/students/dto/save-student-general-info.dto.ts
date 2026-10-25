import { z } from "zod";
import { studentRegistrationStatusEnum, studentStatusEnum } from "@/server/db/schema/students";

export const SaveStudentGeneralInfoInputDTOSchema = z
  .object({
    status: z.enum(studentStatusEnum.enumValues),
    username: z.string().trim().min(1, "Username is required.").max(50),
    facultyId: z.number().int().positive(),
    yearLevel: z.number().int().min(1).max(4),
    university: z.string().trim().max(200).optional(),
  })
  .refine((data) => data.status !== "OTHER_UNIVERSITY" || !!data.university, {
    message: "University is required for students from other universities.",
    path: ["university"],
  });

export type SaveStudentGeneralInfoInputDTO = z.infer<typeof SaveStudentGeneralInfoInputDTOSchema>;

export const SaveStudentGeneralInfoOutputDTOSchema = z.object({
  registrationStatus: z.enum(studentRegistrationStatusEnum.enumValues),
});

export type SaveStudentGeneralInfoOutputDTO = z.infer<typeof SaveStudentGeneralInfoOutputDTOSchema>;
