import type { z } from "zod";
import {
  GetAllActivitiesInputDTOSchema,
  GetAllActivitiesOutputDTOSchema,
} from "@/server/api/modules/activities/dto/get-all-activities.dto";

export const GetSavedActivitiesInputDTOSchema = GetAllActivitiesInputDTOSchema.pick({
  search: true,
  page: true,
  pageSize: true,
});

export type GetSavedActivitiesInputDTO = z.infer<typeof GetSavedActivitiesInputDTOSchema>;

// The same list-item shape the public list returns, so one card renders both.
export const GetSavedActivitiesOutputDTOSchema = GetAllActivitiesOutputDTOSchema;

export type GetSavedActivitiesOutputDTO = z.infer<typeof GetSavedActivitiesOutputDTOSchema>;
