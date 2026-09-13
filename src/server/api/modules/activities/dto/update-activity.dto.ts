import { z } from "zod";
import { ActivityOutputDTOSchema } from "@/server/api/modules/activities/dto/activity.dto";
import {
  APPLICATION_WINDOW_REFINEMENT_MESSAGE,
  ActivityInputBaseDTOSchema,
  applicationWindowRefinement,
} from "@/server/api/modules/activities/dto/create-activity.dto";

export const UpdateActivityInputDTOSchema = ActivityInputBaseDTOSchema.extend({
  id: z.string().uuid(),
}).refine(applicationWindowRefinement, APPLICATION_WINDOW_REFINEMENT_MESSAGE);

export type UpdateActivityInputDTO = z.infer<typeof UpdateActivityInputDTOSchema>;

export const UpdateActivityOutputDTOSchema = ActivityOutputDTOSchema;

export type UpdateActivityOutputDTO = z.infer<typeof UpdateActivityOutputDTOSchema>;
