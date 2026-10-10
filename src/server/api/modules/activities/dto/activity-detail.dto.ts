import { z } from "zod";
import { ActivityOutputDTOSchema } from "@/server/api/modules/activities/dto/activity.dto";
import { ClubDetailOutputDTOSchema } from "@/server/api/modules/clubs/dto";
import {
  ActivityTypeOutputDTOSchema,
  CategoryOutputDTOSchema,
  FacultyOutputDTOSchema,
} from "@/server/api/modules/master-data/dto";

export const ActivityDetailOutputDTOSchema = ActivityOutputDTOSchema.pick({
  id: true,
  title: true,
  description: true,
  posterUrl: true,
  audience: true,
  yearLevels: true,
  applicationFormUrl: true,
  applicationStartAt: true,
  applicationEndAt: true,
}).extend({
  club: ClubDetailOutputDTOSchema.pick({
    id: true,
    name: true,
    logoUrl: true,
    contacts: true,
  }),
  activityType: ActivityTypeOutputDTOSchema,
  categories: z.array(CategoryOutputDTOSchema),
  faculties: z.array(FacultyOutputDTOSchema),
  isApplicationOpen: z.boolean(),
});

export type ActivityDetailOutputDTO = z.infer<typeof ActivityDetailOutputDTOSchema>;
