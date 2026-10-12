import { z } from "zod";
import { ActivityTypeOutputDTOSchema } from "@/server/api/modules/master-data/dto/activity-type.dto";

export type GetAllActivityTypesInputDTO = Record<string, never>;

export const GetAllActivityTypesInputDTOSchema = z.object({});

export const GetAllActivityTypesOutputDTOSchema = z.array(ActivityTypeOutputDTOSchema);

export type GetAllActivityTypesOutputDTO = z.infer<typeof GetAllActivityTypesOutputDTOSchema>;
