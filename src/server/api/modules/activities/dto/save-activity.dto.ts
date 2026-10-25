import { z } from "zod";
import { GetActivityByIdInputDTOSchema } from "@/server/api/modules/activities/dto/get-activity-by-id.dto";

export const SaveActivityInputDTOSchema = GetActivityByIdInputDTOSchema.pick({ activityId: true });

export type SaveActivityInputDTO = z.infer<typeof SaveActivityInputDTOSchema>;

export const SaveActivityOutputDTOSchema = z.object({
  success: z.boolean(),
});

export type SaveActivityOutputDTO = z.infer<typeof SaveActivityOutputDTOSchema>;
