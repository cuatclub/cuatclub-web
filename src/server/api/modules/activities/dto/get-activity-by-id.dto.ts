import { z } from "zod";
import { ActivityDetailOutputDTOSchema } from "@/server/api/modules/activities/dto/activity-detail.dto";
import { ClubDetailOutputDTOSchema } from "@/server/api/modules/clubs/dto";

export const GetActivityByIdInputDTOSchema = z.object({ activityId: z.string().uuid() });

export type GetActivityByIdInputDTO = z.infer<typeof GetActivityByIdInputDTOSchema>;

export const RelatedActivityDTOSchema = ActivityDetailOutputDTOSchema.pick({
  id: true,
  title: true,
  posterUrl: true,
  activityType: true,
  categories: true,
  applicationStartAt: true,
  applicationEndAt: true,
  isApplicationOpen: true,
});

export type RelatedActivityDTO = z.infer<typeof RelatedActivityDTOSchema>;

export const GetActivityByIdOutputDTOSchema = ActivityDetailOutputDTOSchema.extend({
  club: ClubDetailOutputDTOSchema.pick({ id: true, name: true, logoUrl: true }),
  relatedActivities: z.array(RelatedActivityDTOSchema),
});

export type GetActivityByIdOutputDTO = z.infer<typeof GetActivityByIdOutputDTOSchema>;
