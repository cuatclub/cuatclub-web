import { z } from "zod";

export const GetSavedActivityIdsInputDTOSchema = z.object({});

export type GetSavedActivityIdsInputDTO = z.infer<typeof GetSavedActivityIdsInputDTOSchema>;

export const GetSavedActivityIdsOutputDTOSchema = z.object({
  activityIds: z.array(z.string().uuid()),
});

export type GetSavedActivityIdsOutputDTO = z.infer<typeof GetSavedActivityIdsOutputDTOSchema>;
