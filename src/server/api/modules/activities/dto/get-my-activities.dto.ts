import { z } from "zod";
import { ActivityOutputDTOSchema } from "@/server/api/modules/activities/dto/activity.dto";
import { CategoryOutputDTOSchema } from "@/server/api/modules/master-data/dto/category.dto";
import { FacultyOutputDTOSchema } from "@/server/api/modules/master-data/dto/faculty.dto";

export const ActivitySortOptionSchema = z.enum(["CREATED_AT_ASC", "CREATED_AT_DESC"]);

export type ActivitySortOption = z.infer<typeof ActivitySortOptionSchema>;

export const GetMyActivitiesInputDTOSchema = z.object({
  search: z.string().trim().optional(),
  sort: ActivitySortOptionSchema.default("CREATED_AT_DESC"),
});

export type GetMyActivitiesInputDTO = z.infer<typeof GetMyActivitiesInputDTOSchema>;

// Carries everything the "My Posts" edit dialog prefills, so opening it never
// needs a second fetch.
export const ActivityListItemDTOSchema = ActivityOutputDTOSchema.extend({
  categories: z.array(CategoryOutputDTOSchema),
  faculties: z.array(FacultyOutputDTOSchema),
});

export type ActivityListItemDTO = z.infer<typeof ActivityListItemDTOSchema>;

// No pagination fields — the "My Posts" design has no pager.
export const GetMyActivitiesOutputDTOSchema = z.object({
  activities: z.array(ActivityListItemDTOSchema),
});

export type GetMyActivitiesOutputDTO = z.infer<typeof GetMyActivitiesOutputDTOSchema>;
