import { z } from "zod";
import {
  referralSourceEnum,
  studentRegistrationStatusEnum,
  studentStatusEnum,
} from "@/server/db/schema/students";

export const StudentOutputDTOSchema = z.object({
  id: z.string(),
  userId: z.string(),
  registrationStatus: z.enum(studentRegistrationStatusEnum.enumValues),
  status: z.enum(studentStatusEnum.enumValues).nullable(),
  username: z.string().nullable(),
  facultyId: z.number().nullable(),
  yearLevel: z.number().nullable(),
  university: z.string().nullable(),
  referralSource: z.enum(referralSourceEnum.enumValues).nullable(),
  referralOther: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type StudentOutputDTO = z.infer<typeof StudentOutputDTOSchema>;
