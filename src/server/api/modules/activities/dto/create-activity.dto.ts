import { z } from "zod";
import {
  ActivityAudienceSchema,
  ActivityOutputDTOSchema,
} from "@/server/api/modules/activities/dto/activity.dto";

const uniqueIds = (arr: number[]) => new Set(arr).size === arr.length;

export const CreateActivityInputDTOSchema = z
  .object({
    title: z.string().trim().min(1).max(150),
    description: z.string().trim().min(1),
    posterUrl: z.string().url(),
    applicationFormUrl: z.string().trim().min(1).url(),
    activityTypeId: z.number().int().positive(),
    audience: ActivityAudienceSchema,
    categoryIds: z
      .array(z.number().int().positive())
      .min(1, "At least one category must be selected.")
      .refine(uniqueIds, { message: "Duplicate categories are not allowed." }),
    facultyIds: z
      .array(z.number().int().positive())
      .min(1, "At least one faculty must be selected.")
      .refine(uniqueIds, { message: "Duplicate faculties are not allowed." }),
    yearLevels: z
      .array(z.number().int().min(1).max(4))
      .min(1, "At least one year level must be selected.")
      .refine(uniqueIds, { message: "Duplicate year levels are not allowed." }),
    applicationStartAt: z.coerce.date(),
    applicationEndAt: z.coerce.date(),
  })
  .refine((data) => data.applicationEndAt >= data.applicationStartAt, {
    message: "Application end date must be on or after the start date.",
    path: ["applicationEndAt"],
  });

export type CreateActivityInputDTO = z.infer<typeof CreateActivityInputDTOSchema>;

export const CreateActivityOutputDTOSchema = ActivityOutputDTOSchema;

export type CreateActivityOutputDTO = z.infer<typeof CreateActivityOutputDTOSchema>;
