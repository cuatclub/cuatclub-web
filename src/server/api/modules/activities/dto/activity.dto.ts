import { z } from "zod";

export const ActivityAudienceSchema = z.enum(["CHULA_STUDENT", "GENERAL_PUBLIC"]);

export const ActivityOutputDTOSchema = z.object({
  id: z.string(),
  clubId: z.string(),
  activityTypeId: z.number(),
  title: z.string(),
  description: z.string(),
  posterUrl: z.string(),
  audience: ActivityAudienceSchema,
  yearLevels: z.array(z.number()),
  applicationFormUrl: z.string(),
  applicationStartAt: z.date(),
  applicationEndAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ActivityOutputDTO = z.infer<typeof ActivityOutputDTOSchema>;
