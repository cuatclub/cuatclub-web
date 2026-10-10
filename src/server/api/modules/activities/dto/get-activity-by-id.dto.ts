import { z } from "zod";
import { ActivityDetailOutputDTOSchema } from "@/server/api/modules/activities/dto/activity-detail.dto";
import { ClubDetailOutputDTOSchema } from "@/server/api/modules/clubs/dto";

export const GetActivityByIdInputDTOSchema = z.object({ activityId: z.string().uuid() });

export type GetActivityByIdInputDTO = z.infer<typeof GetActivityByIdInputDTOSchema>;

// A related-activity card shows everything the detail header does except the apply link and
// the open/closed badge, plus the posting club — but not its contact channels.
export const RelatedActivityDTOSchema = ActivityDetailOutputDTOSchema.pick({
  id: true,
  title: true,
  description: true,
  posterUrl: true,
  audience: true,
  yearLevels: true,
  activityType: true,
  categories: true,
  faculties: true,
  applicationStartAt: true,
  applicationEndAt: true,
}).extend({
  club: ClubDetailOutputDTOSchema.pick({ id: true, name: true, logoUrl: true }),
});

export type RelatedActivityDTO = z.infer<typeof RelatedActivityDTOSchema>;

export const GetActivityByIdOutputDTOSchema = ActivityDetailOutputDTOSchema.extend({
  relatedActivities: z.array(RelatedActivityDTOSchema),
});

export type GetActivityByIdOutputDTO = z.infer<typeof GetActivityByIdOutputDTOSchema>;
