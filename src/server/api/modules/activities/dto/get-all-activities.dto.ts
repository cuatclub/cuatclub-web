import { z } from "zod";
import {
  ActivityAudienceSchema,
  ActivityOutputDTOSchema,
} from "@/server/api/modules/activities/dto/activity.dto";
import { CategoryOutputDTOSchema } from "@/server/api/modules/master-data/dto/category.dto";
import { FacultyOutputDTOSchema } from "@/server/api/modules/master-data/dto/faculty.dto";
import { ActivitySortOptionSchema } from "@/server/api/modules/activities/dto/get-my-activities.dto";
import { ActivityTypeOutputDTOSchema } from "@/server/api/modules/master-data/dto/activity-type.dto";

export const GetAllActivitiesInputDTOSchema = z.object({
  search: z.string().trim().optional(),
  categoryIds: z.array(z.number().int().positive()).optional(),
  activityTypeIds: z.array(z.number().int().positive()).optional(),
  facultyIds: z.array(z.number().int().positive()).optional(),
  audience: ActivityAudienceSchema.optional(),
  yearLevels: z.array(z.number().int().min(1).max(4)).optional(),
  sort: ActivitySortOptionSchema.default("CREATED_AT_DESC"),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
});

export type GetAllActivitiesInputDTO = z.infer<typeof GetAllActivitiesInputDTOSchema>;

export const PublicActivityListItemDTOSchema = ActivityOutputDTOSchema.pick({
  id: true,
  title: true,
  description: true,
  posterUrl: true,
  audience: true,
  yearLevels: true,
  applicationStartAt: true,
  applicationEndAt: true,
  createdAt: true,
}).extend({
  club: z.object({
    id: z.string(),
    name: z.string(),
    logoUrl: z.string().nullable(),
  }),
  categories: z.array(CategoryOutputDTOSchema),
  faculties: z.array(FacultyOutputDTOSchema),
  activityType: ActivityTypeOutputDTOSchema,
  isApplicationOpen: z.boolean(),
});

export type PublicActivityListItemDTO = z.infer<typeof PublicActivityListItemDTOSchema>;

export const GetAllActivitiesOutputDTOSchema = z.object({
  activities: z.array(PublicActivityListItemDTOSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type GetAllActivitiesOutputDTO = z.infer<typeof GetAllActivitiesOutputDTOSchema>;
