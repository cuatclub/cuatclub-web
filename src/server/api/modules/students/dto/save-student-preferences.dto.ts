import { z } from "zod";
import { studentRegistrationStatusEnum } from "@/server/db/schema/students";

export const SaveStudentPreferencesInputDTOSchema = z.object({
  categoryIds: z.array(z.number().int().positive()).min(1, "Select at least one category."),
  activityTypeIds: z
    .array(z.number().int().positive())
    .min(1, "Select at least one activity type."),
});

export type SaveStudentPreferencesInputDTO = z.infer<typeof SaveStudentPreferencesInputDTOSchema>;

export const SaveStudentPreferencesOutputDTOSchema = z.object({
  registrationStatus: z.enum(studentRegistrationStatusEnum.enumValues),
});

export type SaveStudentPreferencesOutputDTO = z.infer<typeof SaveStudentPreferencesOutputDTOSchema>;
