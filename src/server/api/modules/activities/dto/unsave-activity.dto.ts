import { z } from "zod";
import { SaveActivityInputDTOSchema } from "@/server/api/modules/activities/dto/save-activity.dto";

export const UnsaveActivityInputDTOSchema = SaveActivityInputDTOSchema;

export type UnsaveActivityInputDTO = z.infer<typeof UnsaveActivityInputDTOSchema>;

export const UnsaveActivityOutputDTOSchema = z.object({
  success: z.boolean(),
});

export type UnsaveActivityOutputDTO = z.infer<typeof UnsaveActivityOutputDTOSchema>;
